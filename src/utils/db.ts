import mysql from 'mysql2/promise';

/**
 * 数据库连接配置
 */
const dbConfig = {
  host: '124.223.62.233',
  port: 3306,
  user: 'coze-hub',
  password: '7788Gg7788',
  database: 'coze-hub',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

/**
 * 创建数据库连接
 * @returns Promise<mysql.Connection>
 */
export async function createConnection(): Promise<mysql.Connection> {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

/**
 * 执行数据库查询
 * @param query SQL查询语句
 * @param params 查询参数
 * @returns Promise<any>
 */
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const connection = await createConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('数据库查询失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * 测试数据库连接
 * @returns Promise<boolean>
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await createConnection();
    await connection.ping();
    await connection.end();
    console.log('数据库连接测试成功');
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}