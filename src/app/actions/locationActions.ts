
"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  
  const email = user.emailAddresses[0]?.emailAddress;
  return email === "rtipiani@gmail.com"; 
}

export async function getAdminLocations() {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    const locations = await (prisma as any).touristLocation.findMany({
      orderBy: { name: 'asc' }
    });

    return { success: true, data: locations };
  } catch (error: any) {
    console.error("Error fetching locations:", error);
    return { success: false, error: error.message || "Error interno" };
  }
}

export async function updateLocation(id: string, data: any) {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) throw new Error("No autorizado");

    await (prisma as any).touristLocation.update({
      where: { id },
      data
    });

    revalidatePath("/admin");
    revalidatePath("/mapa");
    revalidatePath(`/destinos/${id}`);
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating location:", error);
    return { success: false, error: error.message || "Error interno" };
  }
}

export async function updateLocationImage(locationId: string, imageUrl: string) {
  return updateLocation(locationId, { image: imageUrl });
}

export async function updateLocationName(locationId: string, name: string) {
  return updateLocation(locationId, { name });
}

export async function createLocation(data: any) {
    try {
        const isAuthorized = await isAdmin();
        if (!isAuthorized) throw new Error("No autorizado");
    
        const newLocation = await (prisma as any).touristLocation.create({
            data: {
                ...data,
                tags: data.tags || [],
                bestMonths: data.bestMonths || [],
            }
        });
    
        revalidatePath("/admin");
        revalidatePath("/mapa");
        revalidatePath("/");
    
        return { success: true, data: newLocation };
    } catch (error: any) {
        console.error("Error creating location:", error);
        return { success: false, error: error.message || "Error interno" };
    }
}

export async function getLocations() {
  try {
    const locations = await (prisma as any).touristLocation.findMany({
      orderBy: { name: 'asc' }
    });
    return { success: true, data: locations };
  } catch (error: any) {
    console.error("Error fetching locations:", error);
    return { success: false, error: error.message || "Error interno" };
  }
}

export async function getLocationById(id: string) {
  try {
    const location = await (prisma as any).touristLocation.findUnique({
      where: { id }
    });
    return { success: true, data: location };
  } catch (error: any) {
    console.error("Error fetching location by id:", error);
    return { success: false, error: error.message || "Error interno" };
  }
}
