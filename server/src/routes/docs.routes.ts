import { Router, Request, Response } from 'express';

const router = Router();

const apiDocs = {
  openapi: '3.0.3',
  info: {
    title: 'Inventory Management API',
    version: '1.0.0',
    description: 'Full-stack envanter yönetim sistemi REST API dokümantasyonu',
  },
  servers: [{ url: '/api', description: 'API Server' }],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'user'] },
        },
      },
      Project: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          siteCount: { type: 'number' },
          itemCount: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Site: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          code: { type: 'string' },
          project: { type: 'string' },
          itemCount: { type: 'number' },
        },
      },
      InventoryItem: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          ipAddress: { type: 'string' },
          serialNumber: { type: 'string' },
          site: { type: 'string' },
          addedBy: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Yeni kullanıcı kaydı',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'fullName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  fullName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Kayıt başarılı' },
          409: { description: 'E-posta zaten kayıtlı' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Kullanıcı girişi',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Giriş başarılı' },
          401: { description: 'Hatalı kimlik bilgileri' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Token yenileme',
        responses: { 200: { description: 'Yeni token çifti' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Mevcut kullanıcı bilgisi',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Kullanıcı bilgisi' } },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Projeleri listele',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Proje listesi' } },
      },
      post: {
        tags: ['Projects'],
        summary: 'Proje oluştur',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Proje oluşturuldu' } },
      },
    },
    '/projects/{id}': {
      put: {
        tags: ['Projects'],
        summary: 'Proje güncelle',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Güncellendi' } },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Proje sil (cascade)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Silindi' } },
      },
    },
    '/projects/{projectId}/sites': {
      get: {
        tags: ['Sites'],
        summary: 'Siteleri listele',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Site listesi' } },
      },
      post: {
        tags: ['Sites'],
        summary: 'Site oluştur',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 201: { description: 'Site oluşturuldu' } },
      },
    },
    '/projects/{projectId}/sites/{siteId}/items': {
      get: {
        tags: ['Inventory'],
        summary: 'Envanter kayıtlarını listele',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'siteId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: { 200: { description: 'Envanter listesi ve pagination' } },
      },
      post: {
        tags: ['Inventory'],
        summary: 'Envanter kaydı ekle',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Kayıt oluşturuldu' } },
      },
    },
    '/projects/{projectId}/sites/{siteId}/items/bulk': {
      post: {
        tags: ['Inventory'],
        summary: 'Toplu envanter aktarımı',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Kayıtlar eklendi' } },
      },
    },
  },
};

router.get('/docs', (_req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html><head>
  <title>Inventory API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head><body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>SwaggerUIBundle({ spec: ${JSON.stringify(apiDocs)}, dom_id: '#swagger-ui' });</script>
</body></html>`;
  res.type('html').send(html);
});

router.get('/docs/json', (_req: Request, res: Response) => {
  res.json(apiDocs);
});

export default router;
