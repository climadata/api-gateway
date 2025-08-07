// Exemplo de como o frontend (React) se conectaria com a API Gateway

// Configuração da API Gateway
const API_GATEWAY_URL = 'http://localhost:3000';

// Classe para gerenciar as chamadas da API
class ApiGatewayClient {
  constructor(baseUrl = API_GATEWAY_URL) {
    this.baseUrl = baseUrl;
  }

  // Método genérico para fazer requisições
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

  // Métodos específicos para cada serviço
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

  // Health check
  async checkHealth() {
    return this.request('/health');
  }
}

// Exemplo de uso em React
const apiClient = new ApiGatewayClient();

// Exemplo 1: Buscar dados do clima
async function fetchWeatherData() {
  try {
    console.log('🌤️ Buscando dados do clima...');
    const weatherData = await apiClient.getWeatherData('São Paulo');
    console.log('✅ Dados do clima:', weatherData);
    return weatherData;
  } catch (error) {
    console.error('❌ Erro ao buscar dados do clima:', error);
    throw error;
  }
}

// Exemplo 2: Login do usuário
async function loginUser(email, password) {
  try {
    console.log('🔐 Fazendo login...');
    const loginResult = await apiClient.login({ email, password });
    console.log('✅ Login realizado:', loginResult);
    return loginResult;
  } catch (error) {
    console.error('❌ Erro no login:', error);
    throw error;
  }
}

// Exemplo 3: Buscar alertas do usuário
async function fetchUserAlerts(userId) {
  try {
    console.log('🔔 Buscando alertas do usuário...');
    const alerts = await apiClient.getAlerts(userId);
    console.log('✅ Alertas encontrados:', alerts);
    return alerts;
  } catch (error) {
    console.error('❌ Erro ao buscar alertas:', error);
    throw error;
  }
}

// Exemplo 4: Health check
async function checkSystemHealth() {
  try {
    console.log('🏥 Verificando saúde do sistema...');
    const health = await apiClient.checkHealth();
    console.log('✅ Status do sistema:', health);
    return health;
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    throw error;
  }
}

// Exemplo de uso em um componente React
/*
import React, { useState, useEffect } from 'react';

function WeatherComponent() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getWeatherData('São Paulo');
        setWeatherData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!weatherData) return <div>Nenhum dado disponível</div>;

  return (
    <div>
      <h2>Clima em São Paulo</h2>
      <p>Temperatura: {weatherData.temperature}°C</p>
      <p>Condição: {weatherData.condition}</p>
    </div>
  );
}
*/

// Teste das funções
async function runExamples() {
  console.log('🚀 Testando integração com API Gateway...\n');

  try {
    // Teste 1: Health check
    await checkSystemHealth();
    
    // Teste 2: Buscar dados do clima (vai falhar porque o serviço não está rodando)
    try {
      await fetchWeatherData();
    } catch (error) {
      console.log('⚠️ Serviço de clima não está rodando (esperado)');
    }
    
    // Teste 3: Login (vai falhar porque o serviço não está rodando)
    try {
      await loginUser('test@example.com', 'password');
    } catch (error) {
      console.log('⚠️ Serviço de auth não está rodando (esperado)');
    }

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiGatewayClient, apiClient };
}

// Executar exemplos se este arquivo for executado diretamente
if (require.main === module) {
  runExamples();
}
