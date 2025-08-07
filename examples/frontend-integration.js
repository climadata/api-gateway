
const API_GATEWAY_URL = 'http://localhost:3000';


class ApiGatewayClient {
  constructor(baseUrl = API_GATEWAY_URL) {
    this.baseUrl = baseUrl;
  }


  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Gateway request failed:', error);
      throw error;
    }
  }


  async getWeatherData(city) {
    return this.request(`/api/weather/city/${city}`);
  }

  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCachedData(key) {
    return this.request(`/api/cache/${key}`);
  }

  async setCachedData(key, data) {
    return this.request(`/api/cache/${key}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAlerts(userId) {
    return this.request(`/api/alerts/user/${userId}`);
  }

  async createAlert(alertData) {
    return this.request('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }


  async checkHealth() {
    return this.request('/health');
  }
}


const apiClient = new ApiGatewayClient();


async function fetchWeatherData() {
  try {
    console.log('Buscando dados do clima');
    const weatherData = await apiClient.getWeatherData('São Paulo');
    console.log('Dados do clima:', weatherData);
    return weatherData;
  } catch (error) {
    console.error(' Erro ao buscar dados do clima:', error);
    throw error;
  }
}


async function loginUser(email, password) {
  try {
    console.log(' Fazendo login');
    const loginResult = await apiClient.login({ email, password });
    console.log('Login realizado:', loginResult);
    return loginResult;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

async function fetchUserAlerts(userId) {
  try {
    console.log('Buscando alertas do usuário');
    const alerts = await apiClient.getAlerts(userId);
    console.log('Alertas encontrados:', alerts);
    return alerts;
  } catch (error) {
    console.error(' Erro ao buscar alertas:', error);
    throw error;
  }
}

async function checkSystemHealth() {
  try {
    console.log('Verificando saúde do sistema');
    const health = await apiClient.checkHealth();
    console.log(' Status do sistema:', health);
    return health;
  } catch (error) {
    console.error(' Erro no health check:', error);
    throw error;
  }
}


async function runExamples() {
  console.log('Testando integração com API Gateway\n');

  try {
    await checkSystemHealth();
    try {
      await fetchWeatherData();
    } catch (error) {
      console.log('Serviço de clima não está rodando (esperado)');
    }
    
    try {
      await loginUser('test@example.com', 'password');
    } catch (error) {
      console.log(' Serviço de auth não está rodando (esperado)');
    }

  } catch (error) {
    console.error(' Erro nos testes:', error);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiGatewayClient, apiClient };
}


if (require.main === module) {
  runExamples();
}
