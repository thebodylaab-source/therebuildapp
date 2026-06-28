import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { nanoid } from "nanoid";

export const communityRoutes = new Hono()
  .use("*", authMiddleware)
  .get("/posts", requireAuth, async (c) => {
    const user = c.get("user")!;
    const posts = await db.select().from(schema.communityPosts)
      .orderBy(desc(schema.communityPosts.createdAt))
      .limit(20);
    
    // Check which posts the current user has liked
    const likes = await db.select().from(schema.communityLikes)
      .where(eq(schema.communityLikes.userId, user.id));
    const likedPostIds = new Set(likes.map(l => l.postId));
    
    const postsWithLikes = posts.map(p => ({
      ...p,
      isLikedByMe: likedPostIds.has(p.id),
    }));
    
    return c.json({ posts: postsWithLikes }, 200);
  })
  .post("/posts", requireAuth, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json();
    
    const post = await db.insert(schema.communityPosts).values({
      id: nanoid(),
      userId: user.id,
      userName: user.name || "Membro",
      ...body,
    }).returning().get();
    
    return c.json({ post }, 201);
  })
  .post("/posts/:id/like", requireAuth, async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.param();
    
    const existing = await db.select().from(schema.communityLikes)
      .where(and(eq(schema.communityLikes.userId, user.id), eq(schema.communityLikes.postId, id)))
      .get();
    
    if (existing) {
      // Unlike
      await db.delete(schema.communityLikes)
        .where(and(eq(schema.communityLikes.userId, user.id), eq(schema.communityLikes.postId, id)));
      await db.update(schema.communityPosts)
        .set({ likesCount: Math.max(0, (await db.select().from(schema.communityPosts).where(eq(schema.communityPosts.id, id)).get())?.likesCount ?? 1 - 1) })
        .where(eq(schema.communityPosts.id, id));
      return c.json({ liked: false }, 200);
    }
    
    await db.insert(schema.communityLikes).values({ id: nanoid(), userId: user.id, postId: id });
    const post = await db.select().from(schema.communityPosts).where(eq(schema.communityPosts.id, id)).get();
    if (post) {
      await db.update(schema.communityPosts)
        .set({ likesCount: post.likesCount + 1 })
        .where(eq(schema.communityPosts.id, id));
    }
    
    return c.json({ liked: true }, 200);
  });
