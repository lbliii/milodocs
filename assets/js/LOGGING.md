# MiloDocs Logging System

The MiloDocs JavaScript system now uses a centralized logging utility to reduce console noise and provide better control over debug output.

## Log Levels

The system supports 5 log levels in order of severity:

1. **ERROR** (0) - Critical errors that need immediate attention
2. **WARN** (1) - Warnings about potential issues
3. **INFO** (2) - General information about system operations
4. **DEBUG** (3) - Detailed debugging information
5. **TRACE** (4) - Very detailed execution traces

## Default Behavior

- **Production**: Only ERROR and WARN messages are shown
- **Localhost**: INFO, WARN, and ERROR messages are shown
- **Debug Mode**: DEBUG, INFO, WARN, and ERROR messages are shown
- **Explicit Setting**: Use `window.MiloDocsLogLevel` to override

## Usage in Components

```javascript
import { logger } from '../utils/Logger.js';

const log = logger.component('MyComponent');

// Use in your component
log.error('Something went wrong:', error);
log.warn('This might be a problem');
log.info('Component initialized');
log.debug('Detailed debug info');
log.trace('Very detailed execution trace');
```

## Controlling Log Levels

### Runtime Control

```javascript
// Set log level at runtime
window.MiloLogger.setLevel('DEBUG');
window.MiloLogger.setLevel('ERROR');

// Check current level
console.log(window.MiloLogger.getLevel());

// See available levels
console.log(window.MiloLogger.levels);
```

### Environment Variables

Set `window.MiloDocsLogLevel` before the system initializes:

```html
<script>
  window.MiloDocsLogLevel = 'DEBUG'; // Show debug and higher
  window.MiloDocsLogLevel = 'ERROR'; // Only show errors
</script>
```

## Special Logging Functions

### Performance Logging
```javascript
logger.performance('LCP', '1250ms', 'ComponentName');
```

### Event Logging
```javascript
logger.event('component:ready', { component: 'search' });
```

### Success Logging
```javascript
logger.success('ComponentName', 'Operation completed successfully');
```

## Migration Notes

The following console methods have been replaced:

- `console.log()` → `log.info()` or `log.debug()`
- `console.warn()` → `log.warn()`
- `console.error()` → `log.error()`
- Emoji-heavy logging → Clean, consistent formatting

## Benefits

1. **Reduced Console Noise**: Default production builds show minimal logging
2. **Consistent Formatting**: All logs follow the same format with timestamps and component names
3. **Runtime Control**: Log levels can be changed without restarting
4. **Performance**: Less overhead in production environments
5. **Debugging**: Enhanced debug information when needed