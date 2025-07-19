# Testing de APIs de Autenticación

## 1. Registro de un pasajero

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pasajero@example.com",
    "password": "123456",
    "name": "Juan Pérez",
    "phone": "+1234567890",
    "role": "passenger",
    "emergencyContact": {
      "name": "María Pérez",
      "phone": "+0987654321"
    }
  }'
```

## 2. Registro de un conductor

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "conductor@example.com",
    "password": "123456",
    "name": "Carlos García",
    "phone": "+1234567891",
    "role": "driver",
    "driverLicense": "ABC123456",
    "vehicleInfo": {
      "make": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "plate": "ABC-123",
      "color": "Blanco"
    }
  }'
```

## 3. Inicio de sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pasajero@example.com",
    "password": "123456"
  }'
```

## 4. Obtener perfil (requiere token)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 5. Refrescar token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN_AQUI"
  }'
```

## Estructura de respuesta esperada

### Registro/Login exitoso:

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "name": "Usuario Ejemplo",
    "role": "passenger"
  }
}
```

### Error:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## Notas importantes:

1. Asegúrate de que MongoDB esté corriendo en tu máquina
2. Cambia JWT_SECRET en .env.local por una clave segura
3. Las contraseñas se encriptan automáticamente con bcrypt
4. Los tokens JWT expiran en 7 días, los refresh tokens en 30 días
5. Guarda el token que recibes al hacer login/register para usarlo en rutas protegidas
