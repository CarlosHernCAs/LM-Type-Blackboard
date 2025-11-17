# Contribuir a EduVerse LMS

¡Gracias por tu interés en contribuir a EduVerse! Este documento proporciona guías para contribuir al proyecto.

## 🚀 Cómo Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado anteriormente
2. Abre un nuevo issue con etiqueta `bug`
3. Incluye:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (OS, Node version, etc.)

### Sugerir Mejoras

1. Abre un issue con etiqueta `enhancement`
2. Describe la mejora propuesta
3. Explica por qué sería útil
4. Si es posible, sugiere una implementación

### Pull Requests

1. Fork el repositorio
2. Crea una rama desde `main`:
   ```bash
   git checkout -b feature/nueva-caracteristica
   ```
3. Haz tus cambios
4. Asegúrate de que:
   - El código sigue el estilo del proyecto
   - Todos los tests pasan
   - Agregaste tests para código nuevo
   - La documentación está actualizada
5. Commit siguiendo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: agregar nueva característica"
   ```
6. Push a tu fork:
   ```bash
   git push origin feature/nueva-caracteristica
   ```
7. Abre un Pull Request

## 📝 Estilo de Código

- Seguimos [TypeScript](https://www.typescriptlang.org/) estricto
- Usamos [Prettier](https://prettier.io/) para formateo
- Ejecuta `npm run lint` antes de commit
- Ejecuta `npm run format` para formatear código

## 🧪 Testing

- Escribe tests para código nuevo
- Ejecuta `npm test` antes de PR
- Mantén coverage > 80%

## 📋 Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva característica
- `fix:` Bug fix
- `docs:` Cambios en documentación
- `style:` Formateo, punto y coma faltante, etc
- `refactor:` Refactoring de código
- `test:` Agregar tests
- `chore:` Mantenimiento

Ejemplos:
```
feat(auth): agregar login con Google
fix(courses): corregir filtro de cursos
docs: actualizar README
```

## 🎯 Áreas de Contribución

Buscamos ayuda especialmente en:

- 🐛 **Bugs**: Revisar y corregir issues
- 📚 **Documentación**: Mejorar docs y tutoriales
- 🧪 **Testing**: Agregar y mejorar tests
- ♿ **Accesibilidad**: Mejorar WCAG compliance
- 🌍 **Internacionalización**: Traducir a más idiomas
- 🎨 **UI/UX**: Mejorar diseño y experiencia
- 🚀 **Performance**: Optimizaciones

## 💬 Comunicación

- GitHub Issues para bugs y features
- GitHub Discussions para preguntas
- Discord para chat en tiempo real

## 📜 Código de Conducta

Por favor, lee nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

## ❓ Preguntas

Si tienes preguntas, puedes:
- Abrir un issue
- Preguntar en Discord
- Email: support@eduverse.com

¡Gracias por contribuir! 🎉
