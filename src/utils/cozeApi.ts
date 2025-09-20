/**
 * Coze工作流API服务
 * 提供工作流执行、状态查询等功能
 */

/**
 * API配置
 */
const COZE_API_CONFIG = {
  baseUrl: 'https://api.coze.cn/v1',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * 工作流执行请求参数接口
 */
export interface WorkflowRunRequest {
  workflow_id: string;
  parameters: {
    [key: string]: any;
  };
  bot_id?: string;
}

/**
 * 工作流执行响应接口
 */
export interface WorkflowRunResponse {
  code: number;
  msg: string;
  data?: {
    id: string;
    workflow_id: string;
    status: 'Running' | 'Completed' | 'Failed' | 'Cancelled';
    created_at: number;
    updated_at: number;
    debug_url?: string;
    error?: {
      code: number;
      msg: string;
    };
  };
}

/**
 * 工作流状态查询响应接口
 */
export interface WorkflowStatusResponse {
  code: number;
  msg: string;
  data?: {
    id: string;
    workflow_id: string;
    status: 'Running' | 'Completed' | 'Failed' | 'Cancelled';
    created_at: number;
    updated_at: number;
    output?: any;
    debug_url?: string;
    error?: {
      code: number;
      msg: string;
    };
  };
}

/**
 * API错误类
 */
export class CozeApiError extends Error {
  public code: number;
  public originalError?: any;

  constructor(message: string, code: number = 0, originalError?: any) {
    super(message);
    this.name = 'CozeApiError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * 创建带超时的fetch请求
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new CozeApiError('请求超时', 408, error);
    }
    throw error;
  }
};

/**
 * 获取认证Token
 */
const getAuthToken = (): string => {
  // 从localStorage获取用户token
  const token = localStorage.getItem('token');
  if (!token) {
    throw new CozeApiError('未找到认证令牌，请先登录', 401);
  }
  return token;
};

/**
 * 执行工作流
 * @param request 工作流执行请求参数
 * @returns 工作流执行响应
 */
export const runWorkflow = async (request: WorkflowRunRequest): Promise<WorkflowRunResponse> => {
  try {
    console.log('🚀 开始执行工作流:', {
      workflow_id: request.workflow_id,
      parameters: request.parameters,
      timestamp: new Date().toISOString()
    });

    // 验证必要参数
    if (!request.workflow_id) {
      throw new CozeApiError('工作流ID不能为空', 400);
    }

    if (!request.parameters) {
      throw new CozeApiError('工作流参数不能为空', 400);
    }

    // 获取认证token
    const token = getAuthToken();

    // 构建请求URL
    const url = `${COZE_API_CONFIG.baseUrl}/workflow/run`;

    // 构建请求体
    const requestBody: {
      workflow_id: string;
      parameters: { [key: string]: any };
      bot_id?: string;
    } = {
      workflow_id: request.workflow_id,
      parameters: request.parameters
    };

    if (request.bot_id) {
      requestBody.bot_id = request.bot_id;
    }

    console.log('📤 发送API请求:', {
      url,
      method: 'POST',
      body: requestBody
    });

    // 发送请求
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        ...COZE_API_CONFIG.headers,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    }, COZE_API_CONFIG.timeout);

    console.log('📥 收到API响应:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // 解析响应
    const responseData: WorkflowRunResponse = await response.json();
    
    console.log('📋 解析响应数据:', responseData);

    // 检查HTTP状态码
    if (!response.ok) {
      throw new CozeApiError(
        `HTTP错误: ${response.status} ${response.statusText}`,
        response.status,
        responseData
      );
    }

    // 检查业务状态码
    if (responseData.code !== 0) {
      throw new CozeApiError(
        responseData.msg || '工作流执行失败',
        responseData.code,
        responseData
      );
    }

    console.log('✅ 工作流执行成功:', responseData.data);
    return responseData;

  } catch (error) {
    console.error('❌ 工作流执行失败:', error);
    
    if (error instanceof CozeApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CozeApiError('网络连接失败，请检查网络设置', 0, error);
    }
    
    throw new CozeApiError(
      error instanceof Error ? error.message : '未知错误',
      0,
      error
    );
  }
};

/**
 * 查询工作流执行状态
 * @param executionId 执行ID
 * @returns 工作流状态响应
 */
export const getWorkflowStatus = async (executionId: string): Promise<WorkflowStatusResponse> => {
  try {
    console.log('🔍 查询工作流状态:', { executionId });

    if (!executionId) {
      throw new CozeApiError('执行ID不能为空', 400);
    }

    // 获取认证token
    const token = getAuthToken();

    // 构建请求URL
    const url = `${COZE_API_CONFIG.baseUrl}/workflow/run/${executionId}`;

    console.log('📤 发送状态查询请求:', { url });

    // 发送请求
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        ...COZE_API_CONFIG.headers,
        'Authorization': `Bearer ${token}`
      }
    }, COZE_API_CONFIG.timeout);

    console.log('📥 收到状态查询响应:', {
      status: response.status,
      statusText: response.statusText
    });

    // 解析响应
    const responseData: WorkflowStatusResponse = await response.json();
    
    console.log('📋 解析状态数据:', responseData);

    // 检查HTTP状态码
    if (!response.ok) {
      throw new CozeApiError(
        `HTTP错误: ${response.status} ${response.statusText}`,
        response.status,
        responseData
      );
    }

    // 检查业务状态码
    if (responseData.code !== 0) {
      throw new CozeApiError(
        responseData.msg || '查询工作流状态失败',
        responseData.code,
        responseData
      );
    }

    console.log('✅ 工作流状态查询成功:', responseData.data);
    return responseData;

  } catch (error) {
    console.error('❌ 工作流状态查询失败:', error);
    
    if (error instanceof CozeApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CozeApiError('网络连接失败，请检查网络设置', 0, error);
    }
    
    throw new CozeApiError(
      error instanceof Error ? error.message : '未知错误',
      0,
      error
    );
  }
};

/**
 * 轮询工作流执行状态直到完成
 * @param executionId 执行ID
 * @param onProgress 进度回调函数
 * @param maxAttempts 最大轮询次数
 * @param interval 轮询间隔（毫秒）
 * @returns 最终状态响应
 */
export const pollWorkflowStatus = async (
  executionId: string,
  onProgress?: (status: WorkflowStatusResponse) => void,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<WorkflowStatusResponse> => {
  console.log('🔄 开始轮询工作流状态:', {
    executionId,
    maxAttempts,
    interval
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const statusResponse = await getWorkflowStatus(executionId);
      
      console.log(`🔄 轮询第${attempt}次:`, {
        status: statusResponse.data?.status,
        attempt,
        maxAttempts
      });

      // 调用进度回调
      onProgress?.(statusResponse);

      // 检查是否完成
      if (statusResponse.data?.status === 'Completed') {
        console.log('✅ 工作流执行完成');
        return statusResponse;
      }

      // 检查是否失败
      if (statusResponse.data?.status === 'Failed') {
        console.log('❌ 工作流执行失败');
        throw new CozeApiError(
          statusResponse.data.error?.msg || '工作流执行失败',
          statusResponse.data.error?.code || 0,
          statusResponse
        );
      }

      // 检查是否取消
      if (statusResponse.data?.status === 'Cancelled') {
        console.log('⏹️ 工作流执行已取消');
        throw new CozeApiError('工作流执行已取消', 0, statusResponse);
      }

      // 如果还在运行，等待后继续轮询
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }

    } catch (error) {
      if (error instanceof CozeApiError) {
        throw error;
      }
      
      console.error(`❌ 轮询第${attempt}次失败:`, error);
      
      // 如果不是最后一次尝试，继续轮询
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
        continue;
      }
      
      throw new CozeApiError(
        '轮询工作流状态失败',
        0,
        error
      );
    }
  }

  throw new CozeApiError(
    `工作流执行超时，已轮询${maxAttempts}次`,
    408
  );
};