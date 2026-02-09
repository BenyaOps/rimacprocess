# OpenAPI / Swagger

Esta carpeta contiene la especificación OpenAPI mínima para documentar los endpoints del servicio.

Archivos:
- `openapi.yaml` — especificación OpenAPI 3.0 (endpoints `GET /appointments` y `POST /appointments`).

Visualizar la especificación:

- Usar el editor en línea: https://editor.swagger.io/ y pegar el contenido de `openapi/openapi.yaml`.

- O servir localmente y abrir con Swagger UI (opción con Docker):

```bash
# desde la raíz del proyecto
docker run --rm -p 8080:8080 -v "${PWD}/openapi:/spec" -e SWAGGER_JSON=/spec/openapi.yaml quay.io/swaggerapi/swagger-ui

# luego abrir http://localhost:8080
```

Alternativa simple (sin Docker):

```bash
# instalar un servidor estático y abrir el archivo en el editor en línea
npx http-server openapi -p 8000
# luego copiar/pegar openapi/openapi.yaml en https://editor.swagger.io/
```

Notas:
- Actualiza `servers.url` en `openapi.yaml` con la URL de tu API antes de publicar.
- Si quieres, puedo añadir un script `npm run serve:openapi` para servir estos archivos localmente.
