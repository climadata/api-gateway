// Exemplo de como os microsserviços se conectariam com a API Gateway

const express = require('express');
const cors = require('cors');

// Exemplo de Weather Service
class WeatherService {
  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'weather',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Weather data endpoint
    this.app.get('/city/:cityName', (req, res) => {
      const { cityName } = req.params;
      
      // Simular dados do clima
      const weatherData = {
        city: cityName,
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        condition: ['Ensolarado', 'Nublado', 'Chuvoso', 'Parcialmente nublado'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 100),
        windSpeed: Math.floor(Math.random() * 20),
        timestamp: new Date().toISOString(),
      };

      res.json(weatherData);
    });

    // Forecast endpoint
    this.app.get('/forecast/:cityName', (req, res) => {
      const { cityName } = req.params;
      
      // Simular previsão de 5 dias
      const forecast = Array.from({ length: 5 }, (_, i) => ({
        day: i + 1,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        temperature: Math.floor(Math.random() * 30) + 10,
        condition: ['Ensolarado', 'Nublado', 'Chuvoso', 'Parcialmente nublado'][Math.floor(Math.random() * 4)],
      }));

      res.json({
        city: cityName,
        forecast,
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🌤️ Weather Service rodando na porta ${this.port}`);
    });
  }
}

// Exemplo de Auth Service
class AuthService {
  constructor(port = 3002) {
    this.app = express();
    this.port = port;
    this.users = new Map(); // Simular banco de dados
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'auth',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Login endpoint
    this.app.post('/login', (req, res) => {
      const { email, password } = req.body;
      
      // Simular autenticação
      if (email === 'test@example.com' && password === 'password') {
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        res.json({
          success: true,
          token,
          user: {
            id: 1,
            email,
            name: 'Usuário Teste',
          },
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
      }
    });

    // Register endpoint
    this.app.post('/register', (req, res) => {
      const { email, password, name } = req.body;
      
      // Simular registro
      if (this.users.has(email)) {
        res.status(400).json({
          success: false,
          message: 'Usuário já existe',
        });
      } else {
        const userId = this.users.size + 1;
        this.users.set(email, { id: userId, email, password, name });
        
        res.json({
          success: true,
          message: 'Usuário registrado com sucesso',
          user: { id: userId, email, name },
        });
      }
    });

    // Verify token endpoint
    this.app.get('/verify/:token', (req, res) => {
      const { token } = req.params;
      
      // Simular verificação de token
      if (token.startsWith('token_')) {
        res.json({
          valid: true,
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Usuário Teste',
          },
        });
      } else {
        res.status(401).json({
          valid: false,
          message: 'Token inválido',
        });
      }
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🔐 Auth Service rodando na porta ${this.port}`);
    });
  }
}

// Exemplo de Cache Service
class CacheService {
  constructor(port = 3003) {
    this.app = express();
    this.port = port;
    this.cache = new Map(); // Simular cache
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'cache',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        cacheSize: this.cache.size,
      });
    });

    // Get cached data
    this.app.get('/:key', (req, res) => {
      const { key } = req.params;
      const data = this.cache.get(key);
      
      if (data) {
        res.json({
          key,
          data,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(404).json({
          key,
          cached: false,
          message: 'Dados não encontrados no cache',
        });
      }
    });

    // Set cached data
    this.app.post('/:key', (req, res) => {
      const { key } = req.params;
      const data = req.body;
      
      this.cache.set(key, {
        ...data,
        cachedAt: new Date().toISOString(),
      });
      
      res.json({
        key,
        success: true,
        message: 'Dados armazenados no cache',
      });
    });

    // Clear cache
    this.app.delete('/:key', (req, res) => {
      const { key } = req.params;
      
      if (this.cache.has(key)) {
        this.cache.delete(key);
        res.json({
          key,
          success: true,
          message: 'Dados removidos do cache',
        });
      } else {
        res.status(404).json({
          key,
          success: false,
          message: 'Dados não encontrados no cache',
        });
      }
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`💾 Cache Service rodando na porta ${this.port}`);
    });
  }
}

// Exemplo de Alert Service
class AlertService {
  constructor(port = 3004) {
    this.app = express();
    this.port = port;
    this.alerts = new Map(); // Simular banco de dados
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'alert',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        activeAlerts: this.alerts.size,
      });
    });

    // Get user alerts
    this.app.get('/user/:userId', (req, res) => {
      const { userId } = req.params;
      
      // Simular alertas do usuário
      const userAlerts = Array.from(this.alerts.values())
        .filter(alert => alert.userId === parseInt(userId));
      
      res.json({
        userId,
        alerts: userAlerts,
        count: userAlerts.length,
      });
    });

    // Create alert
    this.app.post('/', (req, res) => {
      const { userId, city, condition, threshold } = req.body;
      
      const alertId = Date.now();
      const alert = {
        id: alertId,
        userId,
        city,
        condition,
        threshold,
        active: true,
        createdAt: new Date().toISOString(),
      };
      
      this.alerts.set(alertId, alert);
      
      res.json({
        success: true,
        alert,
        message: 'Alerta criado com sucesso',
      });
    });

    // Update alert
    this.app.put('/:alertId', (req, res) => {
      const { alertId } = req.params;
      const updates = req.body;
      
      const alert = this.alerts.get(parseInt(alertId));
      
      if (alert) {
        const updatedAlert = { ...alert, ...updates };
        this.alerts.set(parseInt(alertId), updatedAlert);
        
        res.json({
          success: true,
          alert: updatedAlert,
          message: 'Alerta atualizado com sucesso',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Alerta não encontrado',
        });
      }
    });

    // Delete alert
    this.app.delete('/:alertId', (req, res) => {
      const { alertId } = req.params;
      
      if (this.alerts.has(parseInt(alertId))) {
        this.alerts.delete(parseInt(alertId));
        
        res.json({
          success: true,
          message: 'Alerta removido com sucesso',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Alerta não encontrado',
        });
      }
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🔔 Alert Service rodando na porta ${this.port}`);
    });
  }
}

// Função para iniciar todos os serviços
function startAllServices() {
  console.log('🚀 Iniciando todos os microsserviços...\n');
  
  const weatherService = new WeatherService(3001);
  const authService = new AuthService(3002);
  const cacheService = new CacheService(3003);
  const alertService = new AlertService(3004);
  
  weatherService.start();
  authService.start();
  cacheService.start();
  alertService.start();
  
  console.log('\n✅ Todos os microsserviços iniciados!');
  console.log('🌤️ Weather Service: http://localhost:3001');
  console.log('🔐 Auth Service: http://localhost:3002');
  console.log('💾 Cache Service: http://localhost:3003');
  console.log('🔔 Alert Service: http://localhost:3004');
  console.log('\n🔗 API Gateway: http://localhost:3000');
  console.log('📱 Frontend: http://localhost:3005');
}

// Exportar classes para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WeatherService,
    AuthService,
    CacheService,
    AlertService,
    startAllServices,
  };
}

// Executar se este arquivo for executado diretamente
if (require.main === module) {
  startAllServices();
}
