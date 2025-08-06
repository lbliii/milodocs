---
title: "Notebook Components Test"
description: "Testing the split NotebookViewer components"
weight: 1000
draft: false
---

# 🧪 Notebook Component Split Test

This page tests the refactored NotebookViewer components to ensure all functionality works correctly after the split.

## Test Notebook

<div class="notebook" id="test-notebook-hugo">

<!-- Markdown Cell -->
<div class="notebook-cell" data-cell-type="markdown">
<div class="notebook-cell__content">

### Test Markdown Cell
This is a markdown cell to test the split components.

- Cell detection should work
- Headers should be added automatically  
- Navigation should work with keyboard
- State should persist properly

</div>
</div>

<!-- Code Cell -->
<div class="notebook-cell" data-cell-type="code">
<div class="notebook-cell__content">
<div class="notebook-cell__code-container">

```python
# Python test code
import numpy as np
import pandas as pd

# Create test data
data = np.random.randn(100, 3)
df = pd.DataFrame(data, columns=['A', 'B', 'C'])

print("DataFrame shape:", df.shape)
print(df.head())
```

</div>
<div class="notebook-cell__outputs">
<div class="notebook-cell__output notebook-cell__output--stream">

```
DataFrame shape: (100, 3)
     A         B         C
0  1.234    -0.567     0.890
1 -0.123     1.456    -0.789
2  0.456    -1.234     0.567
3 -0.789     0.123     1.234
4  1.567    -0.890     0.123
```

</div>
</div>
</div>
</div>

<!-- Another Code Cell -->
<div class="notebook-cell" data-cell-type="code">
<div class="notebook-cell__content">
<div class="notebook-cell__code-container">

```python
# Another test code cell
import matplotlib.pyplot as plt

# Create a simple plot
plt.figure(figsize=(8, 6))
plt.plot([1, 2, 3, 4], [1, 4, 2, 3])
plt.title('Test Plot')
plt.xlabel('X axis')
plt.ylabel('Y axis')
plt.show()
```

</div>
</div>
</div>

<!-- Raw Cell -->
<div class="notebook-cell" data-cell-type="raw">
<div class="notebook-cell__content">
<div class="raw-cell-content">

This is a raw cell for testing.
It should be detected and handled correctly.

Raw cells don't execute - they're just text.

</div>
</div>
</div>

</div>

## Manual Test Instructions

1. **Navigation Test**: Use arrow keys or `j`/`k` to navigate between cells
2. **Collapse Test**: Click cell headers or toggle buttons to collapse/expand
3. **Copy Test**: Use copy buttons or `Ctrl+Shift+C` to copy cell content
4. **Keyboard Shortcuts**: Try `Ctrl+Shift+E` to expand/collapse all
5. **Accessibility**: Test with screen readers and keyboard-only navigation

## Expected Results

If the component split worked correctly, you should see:

- ✅ Cell headers automatically added
- ✅ Copy buttons in code cells
- ✅ Toggle buttons for collapsible cells
- ✅ Keyboard navigation working
- ✅ ARIA attributes properly set
- ✅ State persistence (collapsed cells stay collapsed on refresh)

<script>
// Add some basic testing functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Testing notebook components...');
    
    // Check if components are loaded
    setTimeout(() => {
        const notebook = document.getElementById('test-notebook-hugo');
        const headers = notebook.querySelectorAll('.notebook-cell__header');
        const copyButtons = notebook.querySelectorAll('.notebook-cell__copy-btn');
        const toggleButtons = notebook.querySelectorAll('.notebook-cell__toggle');
        
        console.log(`📊 Test Results:
- Cells found: ${notebook.querySelectorAll('.notebook-cell').length}
- Headers added: ${headers.length}
- Copy buttons: ${copyButtons.length}
- Toggle buttons: ${toggleButtons.length}
- Component registration: ${window.ComponentManager ? '✅' : '❌'}`);
        
        if (headers.length > 0 && copyButtons.length > 0) {
            console.log('✅ Component split appears to be working correctly!');
        } else {
            console.log('❌ Component split may have issues - check the console for errors');
        }
    }, 2000);
});
</script>