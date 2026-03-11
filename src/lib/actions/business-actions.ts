'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createBusinessProfile(data: {
  userId: string;
  name: string;
  type: string;
  accountType: string;
  taxId?: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  verificationDocUrl?: string;
}) {
  console.log('--- Iniciando creación de perfil profesional ---');
  console.log('Usuario ID:', data.userId);
  
  try {
    // Verificar si ya existe un perfil
    const existingProfile = await prisma.businessProfile.findUnique({
      where: { userId: data.userId }
    });

    if (existingProfile) {
      console.log('El perfil ya existe para este usuario:', existingProfile.id);
      return { success: true, profile: existingProfile, alreadyExists: true };
    }

    const prismaData = {
      userId: data.userId,
      name: data.name,
      type: data.type,
      accountType: data.accountType,
      taxId: data.taxId || null,
      description: data.description,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      website: data.website || null,
      logoUrl: data.logoUrl || null,
      bannerUrl: data.bannerUrl || null,
      verificationDocUrl: data.verificationDocUrl || null,
    };

    console.log('Datos procesados para Prisma:', { 
      ...prismaData, 
      logoUrl: prismaData.logoUrl ? 'PRESENT' : 'NULL',
      verificationDocUrl: prismaData.verificationDocUrl ? 'PRESENT' : 'NULL'
    });

    const profile = await prisma.businessProfile.create({
      data: prismaData,
    });
    
    console.log('Perfil creado con éxito:', profile.id);
    revalidatePath('/professional');
    return { success: true, profile };
  } catch (error: any) {
    console.error('ERROR CRÍTICO EN createBusinessProfile:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Stack:', error.stack);
    
    return { 
      success: false, 
      error: error.message || 'Failed to create professional profile' 
    };
  }
}

export async function getBusinessProfile(userId: string) {
  try {
    const profile = await (prisma as any).businessProfile.findUnique({
      where: { userId },
    });
    return profile;
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return null;
  }
}

export async function updateBusinessProfile(userId: string, data: any) {
  try {
    const updated = await (prisma as any).businessProfile.update({
      where: { userId },
      data,
    });
    revalidatePath('/professional');
    return { success: true, profile: updated };
  } catch (error) {
    console.error('Error updating business profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function addBalance(userId: string, amount: number) {
  try {
    const updated = await (prisma as any).businessProfile.update({
      where: { userId },
      data: {
        balance: {
          increment: amount
        }
      }
    });
    revalidatePath('/professional');
    return { success: true, balance: updated.balance };
  } catch (error) {
    console.error('Error adding balance:', error);
    return { success: false, error: 'Failed to add balance' };
  }
}

export async function createAdCampaign(userId: string, data: {
  name: string;
  budget: number;
  targetRegion?: string;
  targetType?: string;
  targetId?: string;
}) {
  try {
    const business = await (prisma as any).businessProfile.findUnique({
      where: { userId }
    });

    console.log('--- Iniciando creación de solicitud de campaña (PENDING) ---');
    
    // Verificar si ya existe una campaña PENDING para este mismo objetivo
    if (data.targetId) {
      const existingPending = await (prisma as any).$queryRaw`
        SELECT id FROM "AdCampaign" 
        WHERE "targetId" = ${data.targetId} AND status = 'PENDING'
        LIMIT 1
      `;
      if ((existingPending as any[]).length > 0) {
        return { success: false, error: 'Ya existe una solicitud de promoción pendiente para este post.' };
      }
    }

    const campaignId = crypto.randomUUID();
    
    // Insertar campaña con estado PENDING sin descontar saldo aún
    await (prisma as any).$executeRaw`
      INSERT INTO "AdCampaign" ("id", "name", "budget", "spent", status, "targetRegion", "targetId", "targetType", "businessId", "createdAt", "updatedAt")
      VALUES (
        ${campaignId}, 
        ${data.name}, 
        ${Number(data.budget)}, 
        0.0, 
        'PENDING', 
        ${data.targetRegion || null}, 
        ${data.targetId || null}, 
        ${data.targetType || null}, 
        ${business.id}, 
        NOW(), 
        NOW()
      )
    `;

    revalidatePath('/professional');
    return { success: true, message: 'Solicitud enviada para aprobación del administrador.' };
  } catch (error: any) {
    console.error('ERROR CRÍTICO EN createAdCampaign:', error);
    return { success: false, error: `Error: ${error.message || 'Failed to create campaign'}` };
  }
}

export async function getCampaigns(userId: string) {
  try {
    const business = await (prisma as any).businessProfile.findUnique({
      where: { userId },
      include: { campaigns: true }
    });
    return business?.campaigns || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

export async function createPaymentRequest(userId: string, amount: number, receiptUrl: string, method: string = 'YAPE') {
  try {
    const business = await prisma.businessProfile.findUnique({
      where: { userId }
    });

    if (!business) return { success: false, error: 'Perfil no encontrado' };

    // Insertar vía Raw SQL para evitar errores de cliente no generado (EPERM en Windows)
    const paymentId = crypto.randomUUID();
    await (prisma as any).$executeRaw`
      INSERT INTO "PaymentRequest" (id, amount, "receiptUrl", status, method, "businessId", "createdAt", "updatedAt")
      VALUES (${paymentId}, ${amount}, ${receiptUrl}, 'PENDING', ${method}, ${business.id}, NOW(), NOW())
    `;

    revalidatePath('/professional');
    return { success: true };
  } catch (error) {
    console.error('Error creating payment request:', error);
    return { success: false, error: 'No se pudo registrar el comprobante' };
  }
}

export async function getMyPaymentRequests(userId: string) {
  try {
    const payments = await (prisma as any).$queryRaw`
      SELECT * FROM "PaymentRequest" 
      WHERE "businessId" = (SELECT id FROM "BusinessProfile" WHERE "userId" = ${userId})
      ORDER BY "createdAt" DESC
    `;
    return (payments as any[]) || [];
  } catch (error) {
    console.error('Error fetching my payments:', error);
    return [];
  }
}

export async function getBusinessPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return posts;
  } catch (error) {
    console.error('Error fetching business posts:', error);
    return [];
  }
}

export async function getSponsoredProfiles() {
  try {
    console.log('--- Fetching sponsored profiles (Raw SQL JOIN) ---');
    // 1. Obtener perfiles con campañas activas de tipo PROFILE usando JOIN (SQL puro)
    const profiles: any[] = await (prisma as any).$queryRaw`
      SELECT DISTINCT b.* 
      FROM "BusinessProfile" b
      INNER JOIN "AdCampaign" c ON b."id" = c."businessId"
      WHERE c."status" = 'ACTIVE' AND c."targetType" = 'PROFILE'
      LIMIT 5
    `;

    console.log('Sponsored profiles found:', profiles.length);
    return profiles;
  } catch (error) {
    console.error('Error fetching sponsored profiles with raw SQL JOIN:', error);
    return [];
  }
}
