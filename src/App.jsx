import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Code, ChevronRight, FileText, Cpu, Clock, TrendingUp, Eye } from 'lucide-react';

const CodeVisualizer = () => {
  const [userCode, setUserCode] = useState(`function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`);
  const [parsedCode, setParsedCode] = useState(null);
  const [complexity, setComplexity] = useState(null);
  const [visualization, setVisualization] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('analysis');
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [showConsole, setShowConsole] = useState(true);
  const canvasRef = useRef(null);

  // Jellyfish animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    const jellyfish = [];
    for (let i = 0; i < 6; i++) {
      jellyfish.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 25 + 15,
        speed: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.2 + 0.05
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      jellyfish.forEach((jelly) => {
        jelly.y -= jelly.speed;
        jelly.x += Math.sin(jelly.phase + Date.now() * 0.0008) * 0.3;
        jelly.phase += 0.008;

        if (jelly.y < -jelly.size) {
          jelly.y = canvas.height + jelly.size;
          jelly.x = Math.random() * canvas.width;
        }

        // Draw jellyfish
        ctx.globalAlpha = jelly.opacity;
        ctx.fillStyle = '#4DD0E1';
        const pixelSize = 2;
        const bodyWidth = Math.floor(jelly.size / pixelSize);
        const bodyHeight = Math.floor(jelly.size * 0.7 / pixelSize);

        // Body
        for (let x = 0; x < bodyWidth; x++) {
          for (let y = 0; y < bodyHeight; y++) {
            if (Math.pow(x - bodyWidth/2, 2) + Math.pow(y - bodyHeight/2, 2) < Math.pow(bodyWidth/2, 2)) {
              ctx.fillRect(
                jelly.x + (x - bodyWidth/2) * pixelSize,
                jelly.y + y * pixelSize,
                pixelSize,
                pixelSize
              );
            }
          }
        }

        // Tentacles
        ctx.fillStyle = '#80DEEA';
        for (let t = 0; t < 3; t++) {
          const tentacleX = jelly.x + (t - 1) * (jelly.size / 3);
          for (let i = 0; i < 6; i++) {
            const wave = Math.sin(jelly.phase + t + i * 0.3) * 1.5;
            ctx.fillRect(
              tentacleX + wave,
              jelly.y + jelly.size * 0.7 + i * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Syntax error checker
  const checkSyntaxErrors = (codeString) => {
    const errors = [];
    const warnings = [];
    const lines = codeString.split('\n');
    
    let braceStack = [];
    let parenStack = [];
    let bracketStack = [];
    let inString = false;
    let stringChar = '';
    
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
      
      // Check for common syntax issues
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const prevChar = line[i - 1];
        
        // String handling
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = '';
          }
        }
        
        if (!inString) {
          // Bracket matching
          if (char === '{') braceStack.push({ char, line: lineIndex + 1, col: i + 1 });
          if (char === '(') parenStack.push({ char, line: lineIndex + 1, col: i + 1 });
          if (char === '[') bracketStack.push({ char, line: lineIndex + 1, col: i + 1 });
          
          if (char === '}') {
            if (braceStack.length === 0) {
              errors.push({
                type: 'error',
                message: 'Unmatched closing brace',
                line: lineIndex + 1,
                column: i + 1
              });
            } else {
              braceStack.pop();
            }
          }
          
          if (char === ')') {
            if (parenStack.length === 0) {
              errors.push({
                type: 'error',
                message: 'Unmatched closing parenthesis',
                line: lineIndex + 1,
                column: i + 1
              });
            } else {
              parenStack.pop();
            }
          }
          
          if (char === ']') {
            if (bracketStack.length === 0) {
              errors.push({
                type: 'error',
                message: 'Unmatched closing bracket',
                line: lineIndex + 1,
                column: i + 1
              });
            } else {
              bracketStack.pop();
            }
          }
        }
      }
      
      // Check for missing semicolons (common patterns)
      if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') && !trimmed.includes('//') &&
          !trimmed.startsWith('if') && !trimmed.startsWith('for') && 
          !trimmed.startsWith('while') && !trimmed.startsWith('function') &&
          !trimmed.startsWith('class') && !trimmed.includes('=>') &&
          trimmed.includes('=') && !trimmed.includes('===') && !trimmed.includes('!==')) {
        warnings.push({
          type: 'warning',
          message: 'Missing semicolon',
          line: lineIndex + 1,
          column: trimmed.length
        });
      }
      
      // Check for undefined variables (basic check)
      const varPattern = /\b(\w+)\s*(?!=)/g;
      let match;
      while ((match = varPattern.exec(trimmed)) !== null) {
        const varName = match[1];
        if (!['let', 'const', 'var', 'function', 'class', 'if', 'for', 'while', 
              'return', 'true', 'false', 'null', 'undefined', 'console', 'Math',
              'Array', 'Object', 'String', 'Number', 'Boolean'].includes(varName)) {
          // Simple check - if variable is used but not declared in visible scope
          const declarationPattern = new RegExp(`\\b(let|const|var)\\s+${varName}\\b`);
          const functionPattern = new RegExp(`function\\s+${varName}\\b`);
          if (!codeString.match(declarationPattern) && !codeString.match(functionPattern)) {
            warnings.push({
              type: 'warning',
              message: `'${varName}' may be undefined`,
              line: lineIndex + 1,
              column: match.index + 1
            });
          }
        }
      }
    });
    
    // Check for unclosed brackets
    if (braceStack.length > 0) {
      braceStack.forEach(brace => {
        errors.push({
          type: 'error',
          message: 'Unclosed brace',
          line: brace.line,
          column: brace.col
        });
      });
    }
    
    if (parenStack.length > 0) {
      parenStack.forEach(paren => {
        errors.push({
          type: 'error',
          message: 'Unclosed parenthesis',
          line: paren.line,
          column: paren.col
        });
      });
    }
    
    if (bracketStack.length > 0) {
      bracketStack.forEach(bracket => {
        errors.push({
          type: 'error',
          message: 'Unclosed bracket',
          line: bracket.line,
          column: bracket.col
        });
      });
    }
    
    return [...errors, ...warnings];
  };
  const parseCode = (codeString) => {
    const lines = codeString.split('\n');
    const parsed = {
      functions: [],
      classes: [],
      variables: [],
      loops: [],
      conditions: [],
      dataStructures: [],
      algorithmType: 'unknown'
    };

    let nestedLoops = 0;
    let maxNesting = 0;
    let currentNesting = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const indentation = line.length - line.trimLeft().length;
      
      // Functions
      if (trimmed.includes('function') || /\w+\s*=.*=>/.test(trimmed) || /\w+\s*\([^)]*\)\s*{/.test(trimmed)) {
        const funcMatch = trimmed.match(/function\s+(\w+)|(\w+)\s*=.*=>|(\w+)\s*\(/);
        if (funcMatch) {
          const funcName = funcMatch[1] || funcMatch[2] || funcMatch[3];
          parsed.functions.push({
            name: funcName,
            line: index + 1,
            code: trimmed,
            indentation
          });
          
          // Detect algorithm type
          if (/sort/i.test(funcName)) parsed.algorithmType = 'sorting';
          else if (/search/i.test(funcName)) parsed.algorithmType = 'searching';
          else if (/tree|node/i.test(funcName)) parsed.algorithmType = 'tree';
          else if (/list/i.test(funcName)) parsed.algorithmType = 'list';
        }
      }
      
      // Classes
      if (trimmed.startsWith('class ')) {
        const className = trimmed.match(/class\s+(\w+)/);
        if (className) {
          parsed.classes.push({
            name: className[1],
            line: index + 1,
            code: trimmed,
            indentation
          });
          
          // Detect data structures
          const name = className[1].toLowerCase();
          if (name.includes('node') || name.includes('tree')) parsed.dataStructures.push('Tree/Node');
          if (name.includes('list')) parsed.dataStructures.push('Linked List');
          if (name.includes('stack')) parsed.dataStructures.push('Stack');
          if (name.includes('queue')) parsed.dataStructures.push('Queue');
        }
      }
      
      // Variables
      if (/\b(let|const|var)\s+\w+/.test(trimmed)) {
        const varMatch = trimmed.match(/(let|const|var)\s+(\w+)/);
        if (varMatch) {
          parsed.variables.push({
            name: varMatch[2],
            type: varMatch[1],
            line: index + 1,
            code: trimmed,
            indentation
          });
        }
      }
      
      // Loops and nesting tracking
      if (/\b(for|while)\s*\(/.test(trimmed)) {
        const loopType = trimmed.includes('for') ? 'for' : 'while';
        parsed.loops.push({
          type: loopType,
          line: index + 1,
          code: trimmed,
          nesting: currentNesting,
          indentation
        });
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      }
      
      if (trimmed === '}') {
        currentNesting = Math.max(0, currentNesting - 1);
      }
      
      // Conditions
      if (/\bif\s*\(/.test(trimmed) || trimmed.includes('else')) {
        parsed.conditions.push({
          type: trimmed.includes('if') ? 'if' : 'else',
          line: index + 1,
          code: trimmed,
          indentation
        });
      }
    });

    parsed.maxNesting = maxNesting;
    return parsed;
  };

  // Complexity analysis
  const analyzeComplexity = (parsedCode) => {
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';
    let explanation = '';

    const nestedLoops = parsedCode.loops.filter(loop => loop.nesting > 0).length;
    const totalLoops = parsedCode.loops.length;
    
    // Time complexity analysis
    if (parsedCode.maxNesting >= 3) {
      timeComplexity = 'O(n³)';
      explanation = 'Triple nested loops detected';
    } else if (parsedCode.maxNesting >= 2) {
      timeComplexity = 'O(n²)';
      explanation = 'Nested loops detected (quadratic)';
    } else if (totalLoops > 0) {
      if (parsedCode.algorithmType === 'searching' && parsedCode.conditions.length > 0) {
        timeComplexity = 'O(log n)';
        explanation = 'Binary search pattern detected';
      } else {
        timeComplexity = 'O(n)';
        explanation = 'Single loop detected (linear)';
      }
    } else if (parsedCode.functions.length > 0 && parsedCode.conditions.length > 0) {
      timeComplexity = 'O(log n)';
      explanation = 'Possible divide-and-conquer algorithm';
    }

    // Space complexity analysis
    const recursivePattern = /return.*\w+\(/.test(parsedCode.functions.map(f => f.code).join(''));
    const arrayCreation = parsedCode.variables.filter(v => 
      v.code.includes('[]') || v.code.includes('Array') || v.code.includes('new ')
    ).length;

    if (recursivePattern) {
      spaceComplexity = 'O(log n)';
    } else if (arrayCreation > 1) {
      spaceComplexity = 'O(n)';
    }

    return {
      time: timeComplexity,
      space: spaceComplexity,
      explanation,
      details: {
        totalLoops,
        maxNesting: parsedCode.maxNesting,
        functions: parsedCode.functions.length,
        conditions: parsedCode.conditions.length,
        variables: parsedCode.variables.length
      }
    };
  };

  // Generate visualization data
  const generateVisualization = (parsedCode) => {
    if (parsedCode.algorithmType === 'sorting') {
      return {
        type: 'array',
        data: [64, 34, 25, 12, 22, 11, 90],
        originalData: [64, 34, 25, 12, 22, 11, 90],
        title: 'Sorting Algorithm',
        steps: generateBubbleSortSteps([64, 34, 25, 12, 22, 11, 90])
      };
    } else if (parsedCode.algorithmType === 'searching') {
      return {
        type: 'search',
        data: [1, 3, 5, 7, 9, 11, 13, 15],
        target: 7,
        title: 'Search Algorithm'
      };
    } else if (parsedCode.dataStructures.includes('Tree/Node')) {
      return {
        type: 'tree',
        data: {
          root: 8,
          left: { val: 3, left: { val: 1 }, right: { val: 6 } },
          right: { val: 10, right: { val: 14 } }
        },
        title: 'Tree Structure'
      };
    } else if (parsedCode.dataStructures.includes('Linked List')) {
      return {
        type: 'list',
        data: [1, 2, 3, 4, 5],
        title: 'Linked List'
      };
    } else {
      return {
        type: 'flow',
        data: parsedCode.functions.map(f => ({ name: f.name, line: f.line })),
        title: 'Code Flow'
      };
    }
  };

  // Generate bubble sort steps
  const generateBubbleSortSteps = (arr) => {
    const steps = [];
    const workingArray = [...arr];
    const n = workingArray.length;
    
    steps.push({
      array: [...workingArray],
      comparing: [],
      swapped: false,
      description: "Starting bubble sort"
    });
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Show comparison
        steps.push({
          array: [...workingArray],
          comparing: [j, j + 1],
          swapped: false,
          description: `Comparing ${workingArray[j]} and ${workingArray[j + 1]}`
        });
        
        if (workingArray[j] > workingArray[j + 1]) {
          // Swap elements
          let temp = workingArray[j];
          workingArray[j] = workingArray[j + 1];
          workingArray[j + 1] = temp;
          
          // Show the swap
          steps.push({
            array: [...workingArray],
            comparing: [j, j + 1],
            swapped: true,
            description: `Swapped ${workingArray[j + 1]} and ${workingArray[j]}`
          });
        }
      }
    }
    
    steps.push({
      array: [...workingArray],
      comparing: [],
      swapped: false,
      description: "Sorting complete!"
    });
    
    return steps;
  };

  // Update analysis when code changes
  useEffect(() => {
    const parsed = parseCode(userCode);
    setParsedCode(parsed);
    setComplexity(analyzeComplexity(parsed));
    setVisualization(generateVisualization(parsed));
    setCurrentStep(0);
    
    // Check for syntax errors and update console
    const syntaxErrors = checkSyntaxErrors(userCode);
    const messages = [];
    
    // Add syntax errors/warnings
    syntaxErrors.forEach(error => {
      messages.push({
        type: error.type,
        message: `Line ${error.line}, Col ${error.column}: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      });
    });
    
    // Add analysis info
    if (parsed.algorithmType !== 'unknown') {
      messages.push({
        type: 'info',
        message: `✅ Detected ${parsed.algorithmType} algorithm`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    
    if (parsed.functions.length > 0) {
      messages.push({
        type: 'info',
        message: `📊 Found ${parsed.functions.length} function(s): ${parsed.functions.map(f => f.name).join(', ')}`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    
    if (syntaxErrors.filter(e => e.type === 'error').length === 0) {
      messages.push({
        type: 'success',
        message: '✨ No syntax errors detected!',
        timestamp: new Date().toLocaleTimeString()
      });
    }
    
    setConsoleMessages(messages);
  }, [userCode]);

  // Render visualization based on type
  const renderVisualization = () => {
    if (!visualization) return null;

    if (visualization.type === 'array') {
      const currentStepData = visualization.steps ? visualization.steps[currentStep] : null;
      const displayArray = currentStepData ? currentStepData.array : visualization.data;
      const comparing = currentStepData ? currentStepData.comparing : [];
      const swapped = currentStepData ? currentStepData.swapped : false;
      const description = currentStepData ? currentStepData.description : "Bubble Sort Algorithm";
      
      return (
        <div className="space-y-4">
          <div className="text-center text-cyan-300 font-bold text-lg">
            {description}
          </div>
          <div className="flex items-end justify-center space-x-2 h-48">
            {displayArray.map((value, index) => {
              let bgColor = 'bg-gradient-to-t from-cyan-400 to-blue-300';
              let extraClasses = '';
              
              if (comparing.includes(index)) {
                if (swapped) {
                  bgColor = 'bg-gradient-to-t from-green-400 to-green-300';
                  extraClasses = 'animate-bounce shadow-lg shadow-green-300/50';
                } else {
                  bgColor = 'bg-gradient-to-t from-yellow-400 to-yellow-300';
                  extraClasses = 'animate-pulse shadow-lg shadow-yellow-300/50';
                }
              }
              
              return (
                <div
                  key={`${index}-${value}`}
                  className={`${bgColor} transition-all duration-700 transform ${extraClasses}`}
                  style={{
                    height: `${(value / Math.max(...visualization.originalData)) * 150}px`,
                    width: '32px',
                    imageRendering: 'pixelated',
                    border: '2px solid #00bcd4',
                    transform: swapped && comparing.includes(index) ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  <div className="text-xs font-mono text-center text-white pt-1 font-bold">
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center text-sm text-blue-300">
            Step {currentStep + 1} of {visualization.steps ? visualization.steps.length : 1}
          </div>
        </div>
      );
    }

    if (visualization.type === 'search') {
      return (
        <div className="flex items-center justify-center space-x-2">
          {visualization.data.map((value, index) => (
            <div
              key={index}
              className={`w-14 h-14 flex items-center justify-center text-white font-mono font-bold transition-all duration-300 ${
                index === Math.floor(currentStep / 2) % visualization.data.length 
                  ? 'bg-yellow-300 animate-bounce shadow-lg shadow-yellow-300/50' 
                  : 'bg-gradient-to-br from-cyan-300 to-blue-400'
              }`}
              style={{ 
                imageRendering: 'pixelated',
                border: '2px solid #00bcd4'
              }}
            >
              {value}
            </div>
          ))}
        </div>
      );
    }

    if (visualization.type === 'list') {
      return (
        <div className="flex items-center justify-center space-x-4 overflow-x-auto">
          {visualization.data.map((value, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-16 h-16 flex items-center justify-center text-white font-mono font-bold transition-all duration-300 ${
                index === currentStep % visualization.data.length 
                  ? 'bg-yellow-300 animate-pulse shadow-lg shadow-yellow-300/50' 
                  : 'bg-gradient-to-br from-cyan-300 to-blue-400'
              }`} style={{ border: '2px solid #00bcd4' }}>
                {value}
              </div>
              {index < visualization.data.length - 1 && (
                <ChevronRight className="text-cyan-300 mx-2" size={20} />
              )}
            </div>
          ))}
        </div>
      );
    }

    if (visualization.type === 'flow') {
      return (
        <div className="space-y-4">
          {visualization.data.map((item, index) => (
            <div 
              key={index}
              className={`p-3 text-center transition-all duration-300 ${
                index === currentStep % visualization.data.length
                  ? 'bg-yellow-300 text-gray-800 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              }`}
              style={{ border: '2px solid #00bcd4' }}
            >
              <div className="font-bold font-mono">{item.name}</div>
              <div className="text-xs opacity-75">Line {item.line}</div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const playAnimation = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setCurrentStep(0);
    
    const maxSteps = visualization?.steps?.length || visualization?.data?.length || 5;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      
      if (step >= maxSteps - 1) {
        setIsPlaying(false);
        clearInterval(interval);
      }
    }, 1200); // Slower animation for better visibility of swaps
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 text-white relative" style={{ 
      fontFamily: 'Courier New, monospace', 
      fontWeight: 'bold',
      minHeight: '100vh'
    }}>
      <style jsx>{`
        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e3a8a;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0891b2;
        }
      `}</style>
      {/* Jellyfish Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Header */}
      <div className="relative z-10 p-4" style={{ borderBottom: '1px solid #06b6d4' }}>
        <h1 className="text-3xl font-bold text-center text-cyan-300" style={{
          textShadow: '0 0 5px #00bcd4, 0 0 10px #00bcd4, 0 0 15px #00bcd4, 0 0 20px #2196f3'
        }}>
          CODELYZE
        </h1>
        <p className="text-center text-blue-200 mt-2">Enter your code and watch it come alive</p>
      </div>

      {/* Main Content - Split Screen */}
      <div className="relative z-10 flex flex-col lg:flex-row">
        {/* Left Panel - Code Editor */}
        <div className="w-full lg:w-1/2 p-4" style={{ borderRight: '1px solid #06b6d4' }}>
          <div className="bg-gray-900 bg-opacity-80 overflow-hidden flex flex-col" style={{ border: '2px solid #00bcd4', height: '500px' }}>
            <div className="flex items-center justify-between p-3 bg-blue-800 bg-opacity-50" style={{ borderBottom: '1px solid #06b6d4' }}>
              <h2 className="text-xl font-bold text-cyan-300 flex items-center">
                <Code className="mr-2" size={20} />
                Code Editor
                {consoleMessages.filter(m => m.type === 'error').length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded">
                    {consoleMessages.filter(m => m.type === 'error').length} errors
                  </span>
                )}
                {consoleMessages.filter(m => m.type === 'warning').length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                    {consoleMessages.filter(m => m.type === 'warning').length} warnings
                  </span>
                )}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={playAnimation}
                  disabled={isPlaying || consoleMessages.filter(m => m.type === 'error').length > 0}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 p-2 transition-colors duration-200 flex items-center"
                  style={{ border: '2px solid #00bcd4', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}
                >
                  <Play size={16} className="mr-1" />
                  {isPlaying ? 'Running...' : 'Visualize'}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(0);
                  }}
                  className="bg-red-600 hover:bg-red-500 p-2 transition-colors duration-200 flex items-center"
                  style={{ border: '2px solid #00bcd4', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}
                >
                  <RotateCcw size={16} className="mr-1" />
                  Reset
                </button>
              </div>
            </div>
            
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="flex-1 p-4 bg-transparent text-green-300 font-mono text-sm resize-none outline-none leading-relaxed"
              placeholder="Enter your code here..."
              style={{
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
            
            {/* Code Statistics */}
            <div className="p-3 bg-blue-800 bg-opacity-30 grid grid-cols-3 gap-4 text-sm" style={{ borderTop: '1px solid #06b6d4' }}>
              <div className="text-center">
                <div className="text-cyan-300 font-bold">{userCode.split('\n').length}</div>
                <div className="text-blue-200">Lines</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-300 font-bold">{userCode.length}</div>
                <div className="text-blue-200">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-300 font-bold">{parsedCode?.functions?.length || 0}</div>
                <div className="text-blue-200">Functions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Analysis & Visualization */}
        <div className="w-full lg:w-1/2 p-4 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex mb-4 shrink-0">
            {[
              { id: 'analysis', label: 'Analysis', icon: Cpu },
              { id: 'complexity', label: 'Complexity', icon: TrendingUp },
              { id: 'visualization', label: 'Visualization', icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-3 transition-all duration-200 flex items-center justify-center ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                    : 'bg-blue-800 bg-opacity-50 hover:bg-blue-700 text-blue-200'
                }`}
                style={{ 
                  border: '2px solid #00bcd4',
                  fontFamily: 'Courier New, monospace',
                  fontWeight: 'bold'
                }}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-blue-800 bg-opacity-50 p-4" style={{ border: '2px solid #00bcd4', height: '400px' }}>
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#06b6d4 #1e3a8a'
            }}>
              {activeTab === 'analysis' && parsedCode && (
                <div className="space-y-4">
                  <div className="bg-blue-800 bg-opacity-50 p-4" style={{ border: '2px solid #00bcd4' }}>
                    <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center">
                      <FileText className="mr-2" size={18} />
                      Code Structure
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {parsedCode.functions.length > 0 && (
                        <div className="bg-blue-900 bg-opacity-50 p-3" style={{ border: '2px solid #00bcd4' }}>
                          <h4 className="text-yellow-300 font-bold mb-2">Functions ({parsedCode.functions.length})</h4>
                          <div className="max-h-32 overflow-y-auto">
                            {parsedCode.functions.map((func, index) => (
                              <div key={index} className="text-sm text-blue-200 mb-1 flex justify-between">
                                <span>{func.name}</span>
                                <span className="text-cyan-400">L{func.line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {parsedCode.classes.length > 0 && (
                        <div className="bg-blue-900 bg-opacity-50 p-3" style={{ border: '2px solid #00bcd4' }}>
                          <h4 className="text-yellow-300 font-bold mb-2">Classes ({parsedCode.classes.length})</h4>
                          <div className="max-h-32 overflow-y-auto">
                            {parsedCode.classes.map((cls, index) => (
                              <div key={index} className="text-sm text-blue-200 mb-1 flex justify-between">
                                <span>{cls.name}</span>
                                <span className="text-cyan-400">L{cls.line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {parsedCode.loops.length > 0 && (
                        <div className="bg-blue-900 bg-opacity-50 p-3" style={{ border: '2px solid #00bcd4' }}>
                          <h4 className="text-yellow-300 font-bold mb-2">Loops ({parsedCode.loops.length})</h4>
                          <div className="max-h-32 overflow-y-auto">
                            {parsedCode.loops.map((loop, index) => (
                              <div key={index} className="text-sm text-blue-200 mb-1 flex justify-between">
                                <span>{loop.type} (nest: {loop.nesting})</span>
                                <span className="text-cyan-400">L{loop.line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {parsedCode.variables.length > 0 && (
                        <div className="bg-blue-900 bg-opacity-50 p-3" style={{ border: '2px solid #00bcd4' }}>
                          <h4 className="text-yellow-300 font-bold mb-2">Variables ({parsedCode.variables.length})</h4>
                          <div className="max-h-32 overflow-y-auto">
                            {parsedCode.variables.slice(0, 8).map((variable, index) => (
                              <div key={index} className="text-sm text-blue-200 mb-1 flex justify-between">
                                <span>{variable.name} ({variable.type})</span>
                                <span className="text-cyan-400">L{variable.line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-cyan-900 bg-opacity-30" style={{ border: '2px solid #00bcd4' }}>
                      <h4 className="text-cyan-300 font-bold mb-2">Detected Pattern</h4>
                      <div className="text-sm text-blue-200">
                        <strong>Algorithm Type:</strong> {parsedCode.algorithmType || 'General Purpose'}
                      </div>
                      {parsedCode.dataStructures.length > 0 && (
                        <div className="text-sm text-blue-200 mt-1">
                          <strong>Data Structures:</strong> {parsedCode.dataStructures.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'complexity' && complexity && (
                <div className="space-y-4">
                  <div className="bg-blue-800 bg-opacity-50 p-4" style={{ border: '2px solid #00bcd4' }}>
                    <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center">
                      <Clock className="mr-2" size={18} />
                      Complexity Analysis
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gradient-to-r from-red-600 to-red-500 p-4" style={{ border: '2px solid #00bcd4' }}>
                        <h4 className="text-white font-bold mb-2">Time Complexity</h4>
                        <div className="text-2xl font-bold text-yellow-300" style={{ fontFamily: 'Courier New, monospace' }}>{complexity.time}</div>
                        <div className="text-sm text-red-100 mt-2">{complexity.explanation}</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-600 to-green-500 p-4" style={{ border: '2px solid #00bcd4' }}>
                        <h4 className="text-white font-bold mb-2">Space Complexity</h4>
                        <div className="text-2xl font-bold text-yellow-300" style={{ fontFamily: 'Courier New, monospace' }}>{complexity.space}</div>
                        <div className="text-sm text-green-100 mt-2">Memory usage pattern</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-blue-900 bg-opacity-50 p-4" style={{ border: '2px solid #00bcd4' }}>
                      <h4 className="text-yellow-300 font-bold mb-2">Analysis Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-blue-200">Total Loops: <span className="text-cyan-300">{complexity.details.totalLoops}</span></div>
                          <div className="text-blue-200">Max Nesting: <span className="text-cyan-300">{complexity.details.maxNesting}</span></div>
                          <div className="text-blue-200">Functions: <span className="text-cyan-300">{complexity.details.functions}</span></div>
                        </div>
                        <div>
                          <div className="text-blue-200">Conditions: <span className="text-cyan-300">{complexity.details.conditions}</span></div>
                          <div className="text-blue-200">Variables: <span className="text-cyan-300">{complexity.details.variables}</span></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30" style={{ border: '2px solid #00bcd4' }}>
                      <h4 className="text-yellow-300 font-bold mb-2"> Optimization Tips</h4>
                      <div className="text-sm text-yellow-100 space-y-1">
                        {complexity.time === 'O(n²)' && <div>• Consider using more efficient sorting algorithms like merge sort or quick sort</div>}
                        {complexity.time === 'O(n³)' && <div>• Try to reduce nested loops or use dynamic programming</div>}
                        {complexity.details.maxNesting > 2 && <div>• High nesting detected - consider breaking into smaller functions</div>}
                        {complexity.details.variables > 10 && <div>• Consider organizing variables into objects or classes</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visualization' && visualization && (
                <div className="space-y-4">
                  <div className="bg-blue-800 bg-opacity-50 p-4" style={{ border: '2px solid #00bcd4' }}>
                    <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center">
                      <Eye className="mr-2" size={18} />
                      {visualization.title}
                    </h3>
                    
                    <div className="bg-blue-900 bg-opacity-50 p-6 min-h-[300px] flex items-center justify-center" style={{ border: '2px solid #00bcd4' }}>
                      {renderVisualization()}
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-blue-300">
                        {isPlaying ? (
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                            Animation Running...
                          </span>
                        ) : (
                          `Step: ${currentStep + 1}`
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={isPlaying}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 p-2 transition-colors duration-200 text-sm"
                          style={{ border: '2px solid #00bcd4', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() => setCurrentStep((currentStep + 1) % ((visualization?.steps?.length || visualization?.data?.length || 5)))}
                          disabled={isPlaying}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 p-2 transition-colors duration-200 text-sm"
                          style={{ border: '2px solid #00bcd4', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                    
                    {/* Visualization Legend */}
                    <div className="mt-4 p-3 bg-cyan-900 bg-opacity-30" style={{ border: '2px solid #00bcd4' }}>
                      <h4 className="text-cyan-300 font-bold mb-2">Legend</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-br from-cyan-300 to-blue-400 mr-2" style={{ border: '2px solid #00bcd4' }}></div>
                          <span className="text-blue-200">Normal Element</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-yellow-300 mr-2" style={{ border: '2px solid #00bcd4' }}></div>
                          <span className="text-blue-200">Active/Current</span>
                        </div>
                        <div className="flex items-center">
                          <ChevronRight className="text-cyan-300 mr-1" size={16} />
                          <span className="text-blue-200">Connection/Flow</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Algorithm Insights */}
                  <div className="bg-purple-800 bg-opacity-50 p-4" style={{ border: '2px solid #00bcd4' }}>
                    <h3 className="text-lg font-bold text-purple-300 mb-3">Algorithm Insights</h3>
                    <div className="space-y-2 text-sm text-purple-100">
                      {parsedCode?.algorithmType === 'sorting' && (
                        <>
                          <div>• This appears to be a sorting algorithm</div>
                          <div>• Watch how elements are compared and swapped</div>
                          <div>• Each step shows the current comparison</div>
                        </>
                      )}
                      {parsedCode?.algorithmType === 'searching' && (
                        <>
                          <div>• This is a search algorithm</div>
                          <div>• The highlighted element shows current search position</div>
                          <div>• Efficient searching reduces the search space each step</div>
                        </>
                      )}
                      {parsedCode?.dataStructures?.includes('Tree/Node') && (
                        <>
                          <div>• Tree structure visualization</div>
                          <div>• Shows hierarchical data organization</div>
                          <div>• Each node can have child connections</div>
                        </>
                      )}
                      {parsedCode?.dataStructures?.includes('Linked List') && (
                        <>
                          <div>• Linear data structure with node connections</div>
                          <div>• Each element points to the next one</div>
                          <div>• Efficient for insertion and deletion</div>
                        </>
                      )}
                      {parsedCode?.algorithmType === 'unknown' && (
                        <>
                          <div>• Code structure analysis</div>
                          <div>• Shows the flow of your functions</div>
                          <div>• Each box represents a code component</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Console Panel */}
      {showConsole && (
        <div className="relative z-10 bg-gray-900 bg-opacity-90 border-t border-cyan-600">
          <div className="flex items-center justify-between p-2 bg-blue-800 bg-opacity-50" style={{ borderBottom: '1px solid #06b6d4' }}>
            <div className="flex items-center">
              <span className="text-cyan-300 font-bold text-sm">🖥️ CONSOLE</span>
              <span className="ml-3 text-xs text-blue-200">
                {consoleMessages.filter(m => m.type === 'error').length} errors, 
                {consoleMessages.filter(m => m.type === 'warning').length} warnings
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setConsoleMessages([])}
                className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 transition-colors"
                style={{ border: '1px solid #00bcd4', fontFamily: 'Courier New, monospace' }}
              >
                Clear
              </button>
              <button
                onClick={() => setShowConsole(false)}
                className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 transition-colors"
                style={{ border: '1px solid #00bcd4', fontFamily: 'Courier New, monospace' }}
              >
                Hide
              </button>
            </div>
          </div>
          
          <div className="p-2 max-h-24 overflow-y-auto custom-scrollbar">
            {consoleMessages.length === 0 ? (
              <div className="text-gray-400 text-sm italic">Console output will appear here...</div>
            ) : (
              <div className="space-y-1">
                {consoleMessages.slice(-10).map((msg, index) => (
                  <div key={index} className={`text-xs flex items-start space-x-2 ${
                    msg.type === 'error' ? 'text-red-300' :
                    msg.type === 'warning' ? 'text-yellow-300' :
                    msg.type === 'success' ? 'text-green-300' :
                    'text-blue-200'
                  }`}>
                    <span className="text-gray-500 min-w-max">[{msg.timestamp}]</span>
                    <span className={`font-bold min-w-max ${
                      msg.type === 'error' ? 'text-red-400' :
                      msg.type === 'warning' ? 'text-yellow-400' :
                      msg.type === 'success' ? 'text-green-400' :
                      'text-cyan-400'
                    }`}>
                      {msg.type.toUpperCase()}:
                    </span>
                    <span>{msg.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show Console Button when hidden */}
      {!showConsole && (
        <button
          onClick={() => setShowConsole(true)}
          className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-500 p-2 transition-colors z-20 flex items-center"
          style={{ border: '2px solid #00bcd4', fontFamily: 'Courier New, monospace', fontWeight: 'bold' }}
        >
          🖥️ Show Console
          {consoleMessages.filter(m => m.type === 'error').length > 0 && (
            <span className="ml-2 px-1 py-0.5 bg-red-600 text-white text-xs rounded">
              {consoleMessages.filter(m => m.type === 'error').length}
            </span>
          )}
        </button>
      )}
      <div className="relative z-10 p-2 bg-blue-800 bg-opacity-50 flex items-center justify-between text-sm" style={{ borderTop: '1px solid #06b6d4' }}>
        <div className="flex items-center space-x-4">
          <span className="text-cyan-300">Algorithm: {parsedCode?.algorithmType || 'Unknown'}</span>
          <span className="text-blue-200">|</span>
          <span className="text-cyan-300">Complexity: {complexity?.time || 'Analyzing...'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-blue-200">{isPlaying ? 'Running' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeVisualizer;