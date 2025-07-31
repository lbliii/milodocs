/**
 * Test file for the new MiloDocs JavaScript system
 * Run this to verify the new architecture is working
 */

// Test the new system
async function testNewSystem() {
  console.log('🧪 Testing MiloDocs new JavaScript architecture...');
  
  try {
    // Test core imports
    const { milo } = await import('./core/MiloCore.js');
    const { ComponentManager } = await import('./core/ComponentManager.js');
    const { eventBus } = await import('./core/EventBus.js');
    
    console.log('✅ Core modules loaded successfully');
    
    // Test utilities
    const { $, copyToClipboard, localStorage } = await import('./utils/index.js');
    
    console.log('✅ Utilities loaded successfully');
    
    // Test component loading
    const { loadComponent } = await import('./components/index.js');
    const clipboardComponent = await loadComponent('article-clipboard');
    
    console.log('✅ Component system working');
    
    // Test event system
    eventBus.emit('test:event', { message: 'System test successful!' });
    
    console.log('✅ Event system working');
    
    console.log('🎉 All tests passed! New system is ready.');
    
    return {
      success: true,
      core: { milo, ComponentManager, eventBus },
      utils: { $, copyToClipboard, localStorage },
      components: { loadComponent }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Auto-run test if this file is loaded directly
if (typeof window !== 'undefined') {
  window.testMiloSystem = testNewSystem;
  
  // Add to global debug if available
  if (window.MiloDebug) {
    window.MiloDebug.runTests = testNewSystem;
  }
}

export { testNewSystem };