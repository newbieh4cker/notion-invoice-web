import { Client } from "@notionhq/client"

/**
 * 노션 API 클라이언트 싱글톤
 * 서버 사이드에서만 사용 가능
 */
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

/** 노션 DB ID 상수 */
export const NOTION_DB = {
  INVOICES: process.env.NOTION_INVOICES_DB_ID ?? "",
  INVOICE_ITEMS: process.env.NOTION_INVOICE_ITEMS_DB_ID ?? "",
  ACCESS_TOKENS: process.env.NOTION_ACCESS_TOKENS_DB_ID ?? "",
} as const
