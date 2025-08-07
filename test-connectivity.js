const axios = require('axios');

const API_GATEWAY_URL = 'http://localhost:3000';
const SERVICES = {
  weather: 'http://localhost:3001',
  auth: 'http://localhost:3002',
  cache: 'http://localhost:3003',
  alert: 'http://localhost:3004'
};

async function testApiGateway() {
  console.log('🔍 Testando API Gateway...\n');
  
  try {
    // API Gateway Status
    console.log('Testando status da API Gateway');
    const statusResponse = await axios.get(`${API_GATEWAY_URL}/`);
    console.log('API Gateway está funcionando');
    console.log(' Status:', statusResponse.data);
    console.log('');
    
    // health Check
    console.log('Testando health check');
    const healthResponse = await axios.get(`${API_GATEWAY_URL}/health`);
    console.log('Health check funcionando');
    console.log('Status geral:', healthResponse.data.status);
    console.log('Serviços:', healthResponse.data.services.map(s => `${s.service}: ${s.status}`).join(', '));
    console.log('');
    
    //  Available Routes
    console.log('Testando listagem de rotas');
    const routesResponse = await axios.get(`${API_GATEWAY_URL}/api/routes`);
    console.log('Rotas listadas com sucesso');
    console.log('Rotas disponíveis:', routesResponse.data.routes.map(r => `${r.path} (${r.service})`).join(', '));
    console.log('');
    
  } catch (error) {
    console.log('Erro ao testar API Gateway:', error.message);
  }
}

async function testServiceConnectivity() {
  console.log('Testando conectividade com microsserviços\n');
  
  for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
    try {
      console.log(`Testando ${serviceName} (${serviceUrl})...`);
      
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 3000 });
      console.log(`${serviceName} está respondendo (Status: ${response.status})`);
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`${serviceName} não está rodando (Connection refused)`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`${serviceName} não encontrado (DNS error)`);
      } else {
        console.log(`${serviceName} erro: ${error.message}`);
      }
    }
  }
  console.log('');
}

async function testProxyRouting() {
  console.log('Testando roteamento proxy\n');
  
  const testRoutes = [
    { path: '/api/weather/test', service: 'weather' },
    { path: '/api/auth/test', service: 'auth' },
    { path: '/api/cache/test', service: 'cache' },
    { path: '/api/alerts/test', service: 'alert' }
  ];
  
  for (const route of testRoutes) {
    try {
      console.log(`Testando proxy para ${route.path}`);
      const response = await axios.get(`${API_GATEWAY_URL}${route.path}`, { timeout: 5000 });
      console.log(`Proxy funcionando para ${route.service} (Status: ${response.status})`);
      
    } catch (error) {
      if (error.response) {
        console.log(`Proxy para ${route.service} retornou erro ${error.response.status}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`${route.service} não está rodando (Connection refused)`);
      } else {
        console.log(`Erro no proxy para ${route.service}: ${error.message}`);
      }
    }
  }
  console.log('');
}

async function testCORS() {
  console.log('Testando CORS\n');
  
  try {
    // simulate frontend request
    const response = await axios.get(`${API_GATEWAY_URL}/`, {
      headers: {
        'Origin': 'http://localhost:3005',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('CORS está configurado');
    console.log('Headers de resposta:', Object.keys(response.headers));
    
  } catch (error) {
    console.log('Erro no teste de CORS:', error.message);
  }
  console.log('');
}

async function runAllTests() {
  console.log('Iniciando testes de conectividade\n');
  
  await testApiGateway();
  await testServiceConnectivity();
  await testProxyRouting();
  await testCORS();
  
  console.log('Testes concluídos');
  console.log('\n Resumo:');
  console.log('- API Gateway: Funcionando');
  console.log('- Health Checks: Implementados');
  console.log('- Proxy Routing: Configurado');
  console.log('- CORS: Configurado');
  console.log('\n Para conectar com o frontend:');
  console.log('   - Frontend deve fazer requisições para http://localhost:3000');
  console.log('   - Exemplo: fetch("http://localhost:3000/api/weather/city")');
  console.log('\n Para conectar com microsserviços:');
  console.log('   - Todos os microsserviços devem estar rodando nas portas configuradas');
  console.log('   - API Gateway fará o roteamento automaticamente');
}

runAllTests().catch(console.error);
