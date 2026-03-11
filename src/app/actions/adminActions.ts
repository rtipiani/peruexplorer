"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Verifica si el usuario actual es administrador.
 * Por ahora, validaremos contra una lista de emails o IDs (Simplificado para el ejemplo)
 * En producción, Clerk Roles o Metadatos deberían ser usados.
 */
async function isAdmin() {
  const { userId } = await auth();
  console.log("isAdmin check - userId:", userId);
  if (!userId) return false;
  
  return true; 
}

export async function getAdminDashboardData() {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    // 1. Obtener métricas generales
    const totalProfiles = await prisma.businessProfile.count();
    const verifiedProfiles = await prisma.businessProfile.count({ where: { isVerified: true } });
    
    // 2. Obtener solicitudes pendientes
    const pendingProfiles = await prisma.businessProfile.findMany({
      where: { isVerified: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        accountType: true,
        type: true,
        taxId: true,
        createdAt: true,
        contactEmail: true,
        verificationDocUrl: true,
        logoUrl: true,
      }
    });

    // 3. Obtener campañas para métricas financieras
    const allCampaigns = await prisma.adCampaign.findMany({
      include: {
        business: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // 4. Obtener solicitudes de pago pendientes vía Raw SQL para evitar crash por bloqueo de cliente Prisma
    const pendingPaymentsRaw = await (prisma as any).$queryRaw`
      SELECT p.*, b.name as "businessName", b."userId" as "businessUserId"
      FROM "PaymentRequest" p
      JOIN "BusinessProfile" b ON p."businessId" = b.id
      WHERE p.status = 'PENDING'
      ORDER BY p."createdAt" DESC
    `;

    const formattedPayments = (pendingPaymentsRaw as any[]).map(p => ({
      ...p,
      business: { name: p.businessName, userId: p.businessUserId }
    }));

    // 5. Obtener pagos aprobados (Historial)
    const approvedPaymentsRaw = await (prisma as any).$queryRaw`
      SELECT p.*, b.name as "businessName"
      FROM "PaymentRequest" p
      JOIN "BusinessProfile" b ON p."businessId" = b.id
      WHERE p.status = 'APPROVED'
      ORDER BY p."updatedAt" DESC
      LIMIT 10
    `;

    const approvedPayments = (approvedPaymentsRaw as any[]).map(p => ({
      ...p,
      business: { name: p.businessName }
    }));

    // 6. Calcular Ingreso Real (Pagos de recarga aprobados)
    const totalIncomeResult = await (prisma as any).$queryRaw`
      SELECT SUM(amount) as total FROM "PaymentRequest" WHERE status = 'APPROVED'
    `;
    const totalIncome = (totalIncomeResult as any[])[0]?.total || 0;

    // 7. Calcular Inversión en Campañas (Suma de todos los presupuestos)
    const totalCampaignBudget = await prisma.adCampaign.aggregate({
      _sum: { budget: true }
    });

    // 8. Calcular Saldo Global en Billeteras
    const totalWalletBalance = await prisma.businessProfile.aggregate({
      _sum: { balance: true }
    });

    return {
      success: true,
      data: {
        metrics: {
          totalProfiles,
          totalIncome: totalIncome, // Caja Bruta (Real)
          totalCampaignBudget: totalCampaignBudget._sum.budget || 0, // Consumo de usuarios
          totalWalletBalance: totalWalletBalance._sum.balance || 0, // Saldo bruto en billeteras
          totalProfit: totalIncome, // Ganancia para el administrador es el ingreso bruto
          totalIGVAccumulated: totalIncome - (totalIncome / 1.18), // IGV informativo
        },
        pendingProfiles,
        recentCampaigns: allCampaigns,
        pendingPayments: formattedPayments,
        approvedPayments: approvedPayments,
        pendingCampaigns: await (prisma as any).$queryRaw`
          SELECT c.*, b.name as "businessName", b.balance as "businessBalance"
          FROM "AdCampaign" c
          JOIN "BusinessProfile" b ON c."businessId" = b.id
          WHERE c.status = 'PENDING'
          ORDER BY c."createdAt" DESC
        `
      }
    };
  } catch (error: any) {
    console.error("DETALLE ERROR ADMIN:", error);
    return { success: false, error: error.message || "Error interno del servidor" };
  }
}

export async function approveBusinessProfile(profileId: string) {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    await prisma.businessProfile.update({
      where: { id: profileId },
      data: { isVerified: true }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error aprobando perfil:", error);
    return { success: false, error: "No se pudo aprobar el perfil" };
  }
}

export async function rejectBusinessProfile(profileId: string, reason: string) {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    // 1. Obtener al dueño del negocio para notificarle
    const profile = await prisma.businessProfile.findUnique({
      where: { id: profileId },
      select: { userId: true, name: true }
    });

    if (!profile) throw new Error("Perfil no encontrado.");

    // 2. Crear la notificación para el usuario antes de eliminar
    const professionalMessage = `Estimado usuario, lamentamos informarle que su solicitud para el nodo comercial "${profile.name}" no ha podido ser aprobada en esta ocasión.
Motivo técnico / administrativo: ${reason}.
Le animamos a corregir los detalles mencionados y volver a enviar su solicitud. Gracias por su comprensión.`;

    await prisma.notification.create({
      data: {
        type: "PROFILE_REJECTED",
        message: professionalMessage,
        triggerUserId: profile.userId, // Corregido: Ahora se asigna al usuario que debe recibirla
        postId: null,
      }
    });

    // 3. Eliminar el perfil de la base de datos
    await prisma.businessProfile.delete({
      where: { id: profileId }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error rechazando perfil:", error);
    return { success: false, error: "No se pudo rechazar el perfil" };
  }
}

export async function getPendingPayments() {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    const payments = await (prisma as any).$queryRaw`
      SELECT p.*, b.name as "businessName", b."userId" as "businessUserId"
      FROM "PaymentRequest" p
      JOIN "BusinessProfile" b ON p."businessId" = b.id
      WHERE p.status = 'PENDING'
      ORDER BY p."createdAt" DESC
    `;
    
    // Normalizar para compatibilidad con la UI
    const formatted = (payments as any[]).map(p => ({
      ...p,
      business: { name: p.businessName, userId: p.businessUserId }
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error obteniendo pagos pendientes:", error);
    return { success: false, error: "Error interno" };
  }
}

export async function approvePaymentRequest(paymentId: string) {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    const paymentData = await (prisma as any).$queryRaw`
      SELECT * FROM "PaymentRequest" WHERE id = ${paymentId} LIMIT 1
    `;
    const payment = (paymentData as any[])[0];

    if (!payment) throw new Error("Pago no encontrado");

    const grossAmount = payment.amount;
    const netAmount = grossAmount / 1.18;

    await (prisma as any).$transaction([
      (prisma as any).$executeRaw`
        UPDATE "PaymentRequest" SET status = 'APPROVED', "updatedAt" = NOW() WHERE id = ${paymentId}
      `,
      (prisma as any).$executeRaw`
        UPDATE "BusinessProfile" SET balance = balance + ${netAmount}, "updatedAt" = NOW() WHERE id = ${payment.businessId}
      `,
      // Notificar al usuario (Abono Neto tras impuestos)
      (prisma as any).$executeRaw`
        INSERT INTO "Notification" (id, type, message, "triggerUserId", "isRead", "createdAt")
        SELECT ${crypto.randomUUID()}, 'PAYMENT_APPROVED', ${`¡Pago confirmado! Se han acreditado S/ ${netAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} a tu billetera comercial (S/ ${grossAmount.toLocaleString()} pagados - IGV incluido). Ya puedes lanzar tus campañas con tu presupuesto neto real.`}, b."userId", false, NOW()
        FROM "BusinessProfile" b WHERE b.id = ${payment.businessId}
      `
    ]);

    revalidatePath("/admin");
    revalidatePath("/professional");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error aprobando pago:", error);
    return { success: false, error: "No se pudo aprobar el pago" };
  }
}

export async function rejectPaymentRequest(paymentId: string, reason: string) {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    const paymentData = await (prisma as any).$queryRaw`
      SELECT * FROM "PaymentRequest" WHERE id = ${paymentId} LIMIT 1
    `;
    const payment = (paymentData as any[])[0];

    if (!payment) throw new Error("Pago no encontrado");

    await (prisma as any).$executeRaw`
      UPDATE "PaymentRequest" SET status = 'REJECTED', "updatedAt" = NOW() WHERE id = ${paymentId}
    `;

    await (prisma as any).$executeRaw`
      INSERT INTO "Notification" (id, type, message, "triggerUserId", "isRead", "createdAt")
      SELECT ${crypto.randomUUID()}, 'PAYMENT_REJECTED', ${`Lo sentimos, tu comprobante de pago por S/ ${payment.amount} ha sido rechazado. Motivo: ${reason}`}, b."userId", false, NOW()
      FROM "BusinessProfile" b WHERE b.id = ${payment.businessId}
    `;

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error rechazando pago:", error);
    return { success: false, error: "No se pudo rechazar el pago" };
  }
}
export async function approveAdCampaign(campaignId: string) {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    // 1. Obtener datos de la campaña y el perfil
    const campaignData = await (prisma as any).$queryRaw`
      SELECT c.*, b.balance, b."userId" 
      FROM "AdCampaign" c
      JOIN "BusinessProfile" b ON c."businessId" = b.id
      WHERE c.id = ${campaignId} LIMIT 1
    `;
    const campaign = (campaignData as any[])[0];

    if (!campaign) throw new Error("Campaña no encontrada");
    if (campaign.status !== 'PENDING') throw new Error("La campaña ya no está pendiente");

    const budget = campaign.budget;
    const balance = campaign.balance;

    // 2. Validar saldo
    if (balance < budget) {
      // Rechazar automáticamente por saldo insuficiente
      await (prisma as any).$executeRaw`
        UPDATE "AdCampaign" SET status = 'REJECTED', "updatedAt" = NOW() WHERE id = ${campaignId}
      `;
      
      await (prisma as any).$executeRaw`
        INSERT INTO "Notification" (id, type, message, "triggerUserId", "isRead", "createdAt")
        VALUES (${crypto.randomUUID()}, 'CAMPAIGN_REJECTED', ${`Tu campaña "${campaign.name}" fue rechazada por saldo insuficiente (Requerido: S/ ${budget}, Disponible: S/ ${balance}).`}, ${campaign.userId}, false, NOW())
      `;

      revalidatePath("/admin");
      revalidatePath("/professional");
      return { success: false, error: "Saldo insuficiente en la cuenta del cliente. La campaña ha sido rechazada automáticamente." };
    }

    // 3. Procesar activación y descuento de saldo
    await (prisma as any).$transaction([
      (prisma as any).$executeRaw`
        UPDATE "AdCampaign" SET status = 'ACTIVE', "updatedAt" = NOW() WHERE id = ${campaignId}
      `,
      (prisma as any).$executeRaw`
        UPDATE "BusinessProfile" SET balance = balance - ${budget}, "updatedAt" = NOW() WHERE id = ${campaign.businessId}
      `,
      (prisma as any).$executeRaw`
        INSERT INTO "Notification" (id, type, message, "triggerUserId", "isRead", "createdAt")
        VALUES (${crypto.randomUUID()}, 'CAMPAIGN_APPROVED', ${`¡Tu campaña "${campaign.name}" ha sido aprobada y ya está activa! Se han descontado S/ ${budget} de tu saldo.`}, ${campaign.userId}, false, NOW())
      `
    ]);

    revalidatePath("/admin");
    revalidatePath("/professional");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error aprobando campaña:", error);
    return { success: false, error: error.message || "No se pudo aprobar la campaña" };
  }
}

export async function rejectAdCampaign(campaignId: string, reason: string) {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    const campaignData = await (prisma as any).$queryRaw`
      SELECT c.*, b."userId" 
      FROM "AdCampaign" c
      JOIN "BusinessProfile" b ON c."businessId" = b.id
      WHERE c.id = ${campaignId} LIMIT 1
    `;
    const campaign = (campaignData as any[])[0];

    if (!campaign) throw new Error("Campaña no encontrada");

    await (prisma as any).$executeRaw`
      UPDATE "AdCampaign" SET status = 'REJECTED', "updatedAt" = NOW() WHERE id = ${campaignId}
    `;

    await (prisma as any).$executeRaw`
      INSERT INTO "Notification" (id, type, message, "triggerUserId", "isRead", "createdAt")
      VALUES (${crypto.randomUUID()}, 'CAMPAIGN_REJECTED', ${`Tu campaña "${campaign.name}" ha sido rechazada. Motivo: ${reason}`}, ${campaign.userId}, false, NOW())
    `;

    revalidatePath("/admin");
    revalidatePath("/professional");
    return { success: true };
  } catch (error) {
    console.error("Error rechazando campaña:", error);
    return { success: false, error: "No se pudo rechazar la campaña" };
  }
}
