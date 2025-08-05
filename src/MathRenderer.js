import React, { useEffect, useRef, useState } from 'react';

const MathRenderer = ({ content }) => {
  const mathRef = useRef(null);
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);

  useEffect(() => {
    const loadMathJax = () => {
      if (!window.MathJax) {
        // Configure MathJax before loading
        window.MathJax = {
          tex: {
            inlineMath: [['\\(', '\\)']],
            displayMath: [['\\[', '\\]']],
            processEscapes: true,
          },
          svg: {
            fontCache: 'global'
          },
          startup: {
            ready: () => {
              console.log('MathJax is loaded, but not yet initialized');
              window.MathJax.startup.defaultReady();
              setMathJaxLoaded(true);
            }
          }
        };

        const mathJaxScript = document.createElement('script');
        mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
        mathJaxScript.async = true;
        document.head.appendChild(mathJaxScript);
      } else if (window.MathJax.typesetPromise) {
        setMathJaxLoaded(true);
      }
    };

    loadMathJax();
  }, []);

  useEffect(() => {
    if (mathJaxLoaded && window.MathJax && window.MathJax.typesetPromise && mathRef.current) {
      window.MathJax.typesetPromise([mathRef.current]).catch((err) => {
        console.error('MathJax typeset error:', err);
      });
    }
  }, [content, mathJaxLoaded]);

  return (
    <div ref={mathRef} dangerouslySetInnerHTML={{ __html: content }} />
  );
};

export default MathRenderer;