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
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00'
};

/**
 * 创建数据库连接池
 */
const pool = mysql.createPool(dbConfig);

/**
 * 获取数据库连接
 * @returns Promise<mysql.PoolConnection>
 */
export const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

/**
 * 执行SQL查询
 * @param sql - SQL语句
 * @param params - 查询参数
 * @returns Promise<any>
 */
export const query = async (sql: string, params?: any[]) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('SQL查询失败:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * 测试数据库连接
 * @returns Promise<boolean>
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await query('SELECT 1');
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
};

export default pool;