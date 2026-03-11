'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createPost(data: {
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  location: string;
  imageUrl?: string;
}) {
  try {
    const post = await prisma.post.create({
      data: {
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        content: data.content,
        location: data.location,
        imageUrl: data.imageUrl,
      },
    });
    revalidatePath('/');

    // Generar notificación global de nueva publicación
    await createNotification({
      type: 'POST_CREATED',
      message: `${data.userName} ha compartido una nueva visión ancestral.`,
      triggerUserId: data.userId,
      postId: post.id
    });

    return { success: true, post };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

export async function createNotification(data: {
  type: string;
  message: string;
  triggerUserId: string;
  postId?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        message: data.message,
        triggerUserId: data.triggerUserId,
        postId: data.postId,
      },
    });
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false };
  }
}

export async function getUnreadNotificationsCount(userId?: string) {
  try {
    if (!userId) return 0;
    const count = await prisma.notification.count({
      where: {
        triggerUserId: userId,
        isRead: false
      }
    });
    return count;
  } catch (error) {
    console.error('Error counting notifications:', error);
    return 0;
  }
}

export async function markNotificationsAsRead(userId?: string) {
  try {
    if (!userId) return { success: false };
    await prisma.notification.updateMany({
      where: {
        triggerUserId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
    revalidatePath('/');
    revalidatePath('/notificaciones');
    return { success: true };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return { success: false };
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { triggerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Traemos las últimas 50
    });
    return notifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
}

export async function getPosts(locationFilter?: string, userId?: string) {
  try {
    const dbUrl = process.env.DATABASE_URL || "NOT_SET";
    console.log(`getPosts diagnostic: Using DB URL starting with: ${dbUrl.substring(0, 20)}...`);
    
    // 1. Obtener IDs de campañas activas
    let promotedIds: string[] = [];
    try {
      const activeCampaigns: any[] = await (prisma as any).$queryRaw`
        SELECT "targetId" FROM "AdCampaign" 
        WHERE status = 'ACTIVE' AND "targetType" = 'POST' AND "targetId" IS NOT NULL
      `;
      promotedIds = activeCampaigns.map(c => c.targetId);
    } catch (e) {
      console.warn('Warning: Could not fetch ad campaigns:', e);
    }

    // 2. Obtener publicaciones (Usamos Prisma ORM por defecto para mayor compatibilidad en Vercel)
    let posts: any[] = [];
    try {
      posts = await prisma.post.findMany({
        where: locationFilter ? { location: locationFilter } : {},
        orderBy: { createdAt: 'desc' },
        take: 30
      });
    } catch (sqlError) {
      console.error('Prisma findMany failed, trying raw SQL fallback:', sqlError);
      posts = locationFilter
        ? await (prisma as any).$queryRaw`SELECT * FROM "Post" WHERE location = ${locationFilter} ORDER BY "createdAt" DESC LIMIT 30`
        : await (prisma as any).$queryRaw`SELECT * FROM "Post" ORDER BY "createdAt" DESC LIMIT 30`;
    }

    console.log(`getPosts diagnostic: Query success. Found ${posts.length} posts.`);

    if (!posts || posts.length === 0) {
      console.log('getPosts diagnostic: Zero posts returned from database.');
      return [];
    }

    // 3. Obtener los likes del usuario actual
    let likedPostIds = new Set<string>();
    if (userId) {
      try {
        const postIds = posts.map(p => p.id);
        const userLikes = await prisma.postLike.findMany({
          where: {
            userId,
            postId: { in: postIds }
          },
          select: { postId: true }
        });
        likedPostIds = new Set(userLikes.map(l => l.postId));
      } catch (e) {
        console.error('Error fetching user likes:', e);
      }
    }

    // 4. Procesar y marcar promocionados + liked
    return posts.map(post => ({
      id: post.id,
      userId: post.userId,
      user_name: post.userName,
      user_avatar: post.userAvatar,
      location: post.location,
      content: post.content,
      image_url: post.imageUrl,
      created_at: post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date(post.createdAt).toISOString(),
      updated_at: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : new Date(post.updatedAt).toISOString(),
      isPromoted: promotedIds.includes(post.id),
      likedByUser: likedPostIds.has(post.id),
      reactions: {
        loves: post.loves || 0,
        comments: post.comments || 0,
      },
    })).sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return 0;
    });
  } catch (error) {
    console.error('CRITICAL: Error in getPosts:', error);
    return [];
  }
}

export async function updatePost(postId: string, userId: string, data: {
  content?: string;
  imageUrl?: string | null;
}) {
  try {
    // Verify ownership
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { success: false, error: 'Post not found' };
    if (post.userId !== userId) return { success: false, error: 'Unauthorized' };

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
    });
    revalidatePath('/');
    return { success: true, post: updated };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

export async function deletePost(postId: string, userId: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { success: false, error: 'Post not found' };
    if (post.userId !== userId) return { success: false, error: 'Unauthorized' };

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

// --- ACCIONES DE COMENTARIOS ---

export async function addComment(data: {
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  parentId?: string;
}) {
  try {
    // 1. Crear el comentario
    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        content: data.content,
        parentId: data.parentId || null,
      }
    });

    // 2. Incrementar el contador en el Post
    await prisma.post.update({
      where: { id: data.postId },
      data: {
        comments: { increment: 1 }
      }
    });

    revalidatePath('/');
    return { success: true, comment };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: 'Failed to add comment' };
  }
}

export async function toggleLike(postId: string, userId: string) {
  try {
    // Verificar si ya existe el like (raw SQL)
    const existing: { id: string }[] = await (prisma as any).$queryRaw`
      SELECT id FROM "PostLike"
      WHERE "postId" = ${postId} AND "userId" = ${userId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Ya le dio like → quitar
      await (prisma as any).$executeRaw`
        DELETE FROM "PostLike"
        WHERE "postId" = ${postId} AND "userId" = ${userId}
      `;
      await prisma.post.update({
        where: { id: postId },
        data: { loves: { decrement: 1 } },
      });
      return { success: true, liked: false };
    } else {
      // No le había dado like → añadir
      await (prisma as any).$executeRaw`
        INSERT INTO "PostLike" (id, "postId", "userId", "createdAt")
        VALUES (gen_random_uuid()::text, ${postId}, ${userId}, NOW())
        ON CONFLICT ("postId", "userId") DO NOTHING
      `;
      await prisma.post.update({
        where: { id: postId },
        data: { loves: { increment: 1 } },
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, liked: false };
  }
}

export async function getUserLikedPost(postId: string, userId: string): Promise<boolean> {
  try {
    const rows: { id: string }[] = await (prisma as any).$queryRaw`
      SELECT id FROM "PostLike"
      WHERE "postId" = ${postId} AND "userId" = ${userId}
      LIMIT 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function getComments(postId: string, userId?: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: userId ? { likesList: { where: { userId } } } : undefined,
    });

    return comments.map((c: any) => ({
      id: c.id,
      userId: c.userId,
      userName: c.userName,
      userAvatar: c.userAvatar,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      likes: c.likes || 0,
      likedByUser: Array.isArray(c.likesList) && c.likesList.length > 0,
      parentId: c.parentId || null,
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function toggleCommentLike(commentId: string, userId: string) {
  try {
    const existing: { id: string }[] = await (prisma as any).$queryRaw`
      SELECT id FROM "CommentLike"
      WHERE "commentId" = ${commentId} AND "userId" = ${userId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      await (prisma as any).$executeRaw`
        DELETE FROM "CommentLike"
        WHERE "commentId" = ${commentId} AND "userId" = ${userId}
      `;
      await prisma.comment.update({
        where: { id: commentId },
        data: { likes: { decrement: 1 } },
      });
      return { success: true, liked: false };
    } else {
      await (prisma as any).$executeRaw`
        INSERT INTO "CommentLike" (id, "commentId", "userId", "createdAt")
        VALUES (gen_random_uuid()::text, ${commentId}, ${userId}, NOW())
        ON CONFLICT ("commentId", "userId") DO NOTHING
      `;
      await prisma.comment.update({
        where: { id: commentId },
        data: { likes: { increment: 1 } },
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return { success: false, liked: false };
  }
}

export async function editComment(commentId: string, userId: string, newContent: string) {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return { success: false, error: 'Comment not found' };
    if (comment.userId !== userId) return { success: false, error: 'Unauthorized' };

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: newContent },
    });

    revalidatePath('/');
    return { success: true, comment: updated };
  } catch (error) {
    console.error('Error editing comment:', error);
    return { success: false, error: 'Failed to edit comment' };
  }
}

export async function deleteComment(commentId: string, userId: string, postId: string) {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return { success: false, error: 'Comment not found' };
    if (comment.userId !== userId) return { success: false, error: 'Unauthorized' };

    await prisma.comment.delete({ where: { id: commentId } });

    // Decrement the comment count on the post
    await prisma.post.update({
      where: { id: postId },
      data: { comments: { decrement: 1 } }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}
