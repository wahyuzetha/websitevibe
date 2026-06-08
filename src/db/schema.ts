import { mysqlTable, int, varchar, timestamp, text } from "drizzle-orm/mysql-core";

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = mysqlTable('settings', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: text('value').notNull()
});

export const advantages = mysqlTable('advantages', {
  id: int('id').autoincrement().primaryKey(),
  icon: varchar('icon', { length: 50 }),
  title: varchar('title', { length: 255 }),
  description: text('description')
});

export const gallery = mysqlTable('gallery', {
  id: int('id').autoincrement().primaryKey(),
  imageUrl: varchar('image_url', { length: 500 }),
  title: varchar('title', { length: 255 })
});

export const careers = mysqlTable('careers', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }),
  description: text('description')
});

export const testimonials = mysqlTable('testimonials', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 255 }),
  rating: int('rating').default(5),
  content: text('content')
});

export const faqs = mysqlTable('faqs', {
  id: int('id').autoincrement().primaryKey(),
  question: text('question'),
  answer: text('answer')
});

export const materials = mysqlTable('materials', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  fileUrl: varchar('file_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const hero_slides = mysqlTable('hero_slides', {
  id: int('id').autoincrement().primaryKey(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  buttonText: varchar('button_text', { length: 100 }),
  buttonLink: varchar('button_link', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow()
});
