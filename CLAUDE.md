# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build`
- **Development server**: `npm start:dev` (with watch mode)
- **Production**: `npm start:prod`
- **Lint**: `npm run lint` (with auto-fix)
- **Format**: `npm run format`
- **Test**: `npm test`
- **Test with watch**: `npm test:watch`
- **Test coverage**: `npm test:coverage`
- **E2E tests**: `npm test:e2e`
- **Debug tests**: `npm run test:debug`

## Architecture

This is a NestJS-based point management system with a TDD focus. The application follows a modular architecture:

### Core Structure
- **AppModule**: Main application module importing PointModule
- **PointModule**: Handles point-related functionality with PointController
- **DatabaseModule**: Provides in-memory table services (UserPointTable, PointHistoryTable)

### Key Components
- **PointController**: REST API endpoints for point operations (`/point`)
  - `GET /:id` - Get user points
  - `GET /:id/histories` - Get point history
  - `PATCH /:id/charge` - Charge points
  - `PATCH /:id/use` - Use points
- **Database Tables**: Injectable services simulating database operations with random delays
  - UserPointTable: In-memory Map-based user point storage
  - PointHistoryTable: Point transaction history storage

### Important Implementation Notes
- Database tables use `setTimeout` with random delays (200-300ms) to simulate real database latency
- UserPointTable and PointHistoryTable should not be modified - use only their public APIs
- Current controller methods contain TODO comments and return placeholder data
- Uses class-validator with ValidationPipe for request validation
- Includes SonarQube integration with jest-sonar-reporter

### Testing Setup
- Jest configuration with coverage reporting to `coverage/` directory
- E2E tests configured in `test/` directory
- Test files follow `*.spec.ts` pattern in `src/` directory
- SonarQube reporting configured for CI/CD integration