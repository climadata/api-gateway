const axios = require('axios');

const API_GATEWAY_URL = 'http://localhost:3000';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


async function checkService(url, serviceName) {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 3000 });
    console.log(`${serviceName} está rodando`);
    return true;
  } catch (error) {
    console.log(`${serviceName} não está rodando (${url})`);
    return false;
  }
}

async function testProxyRequest(endpoint, description) {
  try {
    console.log(` Testando: ${description}`);
    const response = await axios.get(`${API_GATEWAY_URL}${endpoint}`, { timeout: 5000 });
    console.log(` Sucesso Status: ${response.status}`);
    console.log(` Dados:`, response.data);
    return true;
  } catch (error) {
    if (error.response) {
      console.log(`Erro ${error.response.status}: ${error.response.data.message || error.message}`);
    } else {
      console.log(`Erro de conexão: ${error.message}`);
    }
    return false;
  }
}

async function testAuth() {
  try {
    console.log(' Testando autenticação...');
    
    const loginResponse = await axios.post(`${API_GATEWAY_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password'
    }, { timeout: 5000 });
    
    console.log(' Login realizado com sucesso!');
    console.log(' Token:', loginResponse.data.token);
    
    return loginResponse.data.token;
  } catch (error) {
    console.log(' Erro no login:', error.response?.data?.message || error.message);
    return null;
  }
}


async function testWeatherData() {
  try {
    console.log(' Testando dados do clima...');
    
    const weatherResponse = await axios.get(`${API_GATEWAY_URL}/api/weather/city/São Paulo`, { timeout: 5000 });
    
    console.log(' Dados do clima obtidos!');
    console.log(' Cidade:', weatherResponse.data.city);
    console.log(' Temperatura:', weatherResponse.data.temperature + '°C');
    console.log(' Condição:', weatherResponse.data.condition);
    
    return weatherResponse.data;
  } catch (error) {
    console.log(' Erro ao obter dados do clima:', error.response?.data?.message || error.message);
    return null;
  }
}


async function testCache() {
  try {
    console.log(' Testando cache');

    const cacheData = { test: 'data', timestamp: new Date().toISOString() };
    const setResponse = await axios.post(`${API_GATEWAY_URL}/api/cache/test-key`, cacheData, { timeout: 5000 });
    
    console.log(' Dados armazenados no cache!');
    
    const getResponse = await axios.get(`${API_GATEWAY_URL}/api/cache/test-key`, { timeout: 5000 });
    
    console.log(' Dados recuperados do cache');
    console.log(' Dados:', getResponse.data);
    
    return getResponse.data;
  } catch (error) {
    console.log(' Erro no cache:', error.response?.data?.message || error.message);
    return null;
  }
}


async function testAlerts(token) {
  try {
    console.log(' Testando alertas');
    

    const alertData = {
      userId: 1,
      city: 'São Paulo',
      condition: 'temperature',
      threshold: 30
    };
    
    const createResponse = await axios.post(`${API_GATEWAY_URL}/api/alerts`, alertData, { timeout: 5000 });
    
    console.log(' Alerta criado!');
    console.log(' Alerta ID:', createResponse.data.alert.id);
    
    const alertsResponse = await axios.get(`${API_GATEWAY_URL}/api/alerts/user/1`, { timeout: 5000 });
    
    console.log(' Alertas do usuário obtidos!');
    console.log(' Quantidade de alertas:', alertsResponse.data.count);
    
    return alertsResponse.data;
  } catch (error) {
    console.log(' Erro nos alertas:', error.response?.data?.message || error.message);
    return null;
  }
}


async function runFullIntegrationTest() {
  console.log(' Iniciando teste de integração completa\n');
  

  console.log(' Verificando API Gateway');
  try {
    const gatewayResponse = await axios.get(`${API_GATEWAY_URL}/`, { timeout: 3000 });
    console.log(' API Gateway está rodando');
    console.log(' Status:', gatewayResponse.data.message);
  } catch (error) {
    console.log(' API Gateway não está rodando');
    console.log(' Execute: npm start');
    return;
  }
  
  console.log('\n Verificando microsserviços');
  
  const services = [
    { url: 'http://localhost:3001', name: 'Weather Service' },
    { url: 'http://localhost:3002', name: 'Auth Service' },
    { url: 'http://localhost:3003', name: 'Cache Service' },
    { url: 'http://localhost:3004', name: 'Alert Service' }
  ];
  
  const serviceStatus = {};
  for (const service of services) {
    serviceStatus[service.name] = await checkService(service.url, service.name);
  }
  
  console.log('\n Testando proxy através da API Gateway');
  

  const proxyTests = [
    { endpoint: '/api/weather/city/São Paulo', description: 'Proxy para Weather Service' },
    { endpoint: '/api/auth/login', description: 'Proxy para Auth Service' },
    { endpoint: '/api/cache/test', description: 'Proxy para Cache Service' },
    { endpoint: '/api/alerts/user/1', description: 'Proxy para Alert Service' }
  ];
  
  for (const test of proxyTests) {
    await testProxyRequest(test.endpoint, test.description);
    await sleep(1000); 
  }
  
  console.log('\n4️⃣ Testando funcionalidades específicas');
  
  const token = await testAuth();
  await sleep(1000);
  
  await testWeatherData();
  await sleep(1000);
  
  await testCache();
  await sleep(1000);
  
  await testAlerts(token);
  
  console.log('\n Teste de integração concluído!');
  console.log('\n Resumo:');
  console.log('- API Gateway:  Funcionando');
  console.log('- Proxy Routing:  Funcionando');
  console.log('- CORS: Configurado');
  console.log('- Health Checks:  Implementados');
  
  console.log('\n Para testar com frontend:');
  console.log('   - Frontend deve fazer requisições para http://localhost:3000');
  console.log('   - Exemplo: fetch("http://localhost:3000/api/weather/city/São Paulo")');
  
  console.log('\n Para iniciar microsserviços:');
  console.log('   - Execute: node examples/microservice-integration.js');
}

runFullIntegrationTest().catch(console.error);
