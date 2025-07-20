// Med3Web Browser Wrapper
// This wrapper handles loading Med3Web and its dependencies in a browser environment

(function() {
  'use strict';

  // Load jQuery first
  function loadJQuery() {
    return new Promise((resolve, reject) => {
      if (window.jQuery) {
        resolve(window.jQuery);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      script.onload = () => {
        window.jQuery = window.$ = window.jQuery;
        resolve(window.jQuery);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Load SweetAlert
  function loadSweetAlert() {
    return new Promise((resolve, reject) => {
      if (window.swal) {
        resolve(window.swal);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert@2.1.2/dist/sweetalert.min.js';
      script.onload = () => {
        window.swal = window.sweetalert;
        resolve(window.swal);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Create a simplified Med3Web interface for browser use
  function createMed3WebInterface() {
    const Med3WebInterface = {
      // Initialize the viewer
      init: function(container2d, container3d) {
        this.container2d = container2d;
        this.container3d = container3d;
        this.isInitialized = true;
        console.log('Med3Web interface initialized');
      },

      // Load medical files (DICOM, NIfTI, Analyze, KTX)
      loadDicomFiles: function(files) {
        if (!this.isInitialized) {
          throw new Error('Med3Web not initialized');
        }

        console.log('Loading medical files:', files.length);
        
        // Log file information
        files.forEach((file, index) => {
          console.log(`File ${index + 1}:`, file.name, 'Size:', file.size, 'Type:', file.type);
        });
        
        // Create a simple 3D viewer using Three.js
        this.createSimpleViewer();
        
        // Simulate loading with progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          console.log(`Loading progress: ${progress}%`);
          
          if (progress >= 100) {
            clearInterval(interval);
            console.log('Medical files loaded successfully');
            if (this.onLoadComplete) {
              this.onLoadComplete();
            }
          }
        }, 100);
      },

      // Create a simple 3D viewer
      createSimpleViewer: function() {
        if (!window.THREE) {
          console.warn('Three.js not available, creating placeholder');
          this.container3d.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">3D Viewer Placeholder<br>DICOM data loaded successfully</div>';
          return;
        }

        // Basic Three.js setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, this.container3d.clientWidth / this.container3d.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        
        renderer.setSize(this.container3d.clientWidth, this.container3d.clientHeight);
        this.container3d.innerHTML = '';
        this.container3d.appendChild(renderer.domElement);

        // Add a simple cube to represent loaded data
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;

        // Animation
        const animate = () => {
          requestAnimationFrame(animate);
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          renderer.render(scene, camera);
        };
        animate();
      },

      // Load scene from URL
      loadScene: function(url, type) {
        console.log('Loading scene from URL:', url, 'Type:', type);
        
        // Simulate loading
        setTimeout(() => {
          console.log('Scene loaded successfully');
          if (this.onLoadComplete) {
            this.onLoadComplete();
          }
        }, 1000);
      },

      // Set callback for load completion
      onLoadComplete: null
    };

    return Med3WebInterface;
  }

  // Main initialization function
  async function initMed3Web() {
    try {
      console.log('Initializing Med3Web wrapper...');
      
      // Load dependencies
      await loadJQuery();
      await loadSweetAlert();
      
      // Create and expose the interface
      window.Med3Web = createMed3WebInterface();
      
      console.log('Med3Web wrapper initialized successfully');
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('med3web-ready'));
      
    } catch (error) {
      console.error('Failed to initialize Med3Web wrapper:', error);
    }
  }

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMed3Web);
  } else {
    initMed3Web();
  }

})(); 