/**
 * CakeConfiguratorComponent
 * 
 * A comprehensive 3D cake design interface that allows users to:
 * - Customize cake layers with different flavors and thicknesses
 * - Choose frosting types and decorations
 * - View the cake in 3D with realistic materials and lighting
 * - Adjust the view with camera controls
 * - Calculate pricing based on selections
 * - Save designs and add them to cart
 */

/**
 * Main imports for Angular core functionality, forms, and Three.js 3D rendering
 */
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { PMREMGenerator } from 'three';
import { ActivatedRoute } from '@angular/router';
import { CakeOfferService } from './cake-offer.service';
import { HttpClient } from '@angular/common/http';

/**
 * Interface defining a single cake layer's properties
 * Allows for type-safe layer customization with specific flavors and dimensions
 */
interface CakeLayer {
  saveur: 'vanille' | 'chocolat' | 'pistache' | 'caramel' | 'redvelvet';  // Available flavors
  epaisseur: number;  // Layer thickness in cm
}

/**
 * Interface defining the complete cake design configuration
 * Manages all aspects of the cake design including sizing, layers, and contact info
 */
interface CakeDesign {
  patisserieId: string;      // Unique identifier for the cake design
  nombrePersonnes: number | null;  // Number of people the cake serves
  glacage: 'fondant' | 'ganache' | 'creme' | null;  // Frosting type
  telephone: string;         // Customer contact number
  couches: CakeLayer[];     // Array of cake layers
}

/**
 * Type definition for mapping cake materials
 * Associates each flavor and frosting type with its corresponding 3D material
 */
type CakeMaterials = {
  [key in CakeLayer['saveur'] | NonNullable<CakeDesign['glacage']>]: THREE.MeshStandardMaterial;
};

/**
 * Utility class for creating sector geometries for the slice view
 */
class SectorGeometry extends THREE.BufferGeometry {
  constructor(radius: number, angle: number, offsetAngle: number = 0, height: number = 0.1) {
    super();
    
    const segments = 64;  // Increased segment count for smoother geometry
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Create top face vertices
    const topVertices: number[] = [];
    const topNormals: number[] = [];
    const topUvs: number[] = [];
    const topIndices: number[] = [];
    
    // Center point for top face
    topVertices.push(0, height / 2, 0);
    topNormals.push(0, 1, 0);
    topUvs.push(0.5, 0.5);
    
    // Create top face vertices
    for (let i = 0; i <= segments; i++) {
      const segmentAngle = offsetAngle + angle * (i / segments);
      const x = Math.cos(segmentAngle) * radius;
      const z = Math.sin(segmentAngle) * radius;
      
      topVertices.push(x, height / 2, z);
      topNormals.push(0, 1, 0);
      
      // Improved UV mapping for top face
      const u = 0.5 + (Math.cos(segmentAngle) * 0.5);
      const v = 0.5 + (Math.sin(segmentAngle) * 0.5);
      topUvs.push(u, v);
      
      if (i > 0) {
        topIndices.push(0, i, i + 1);
      }
    }
    
    // Create side face vertices with improved geometry
    const sideVertices: number[] = [];
    const sideNormals: number[] = [];
    const sideUvs: number[] = [];
    const sideTriangles: number[] = [];  // Renamed from sideIndices to avoid duplicate declaration
    
    // Create two rings of vertices for the side faces
    for (let i = 0; i <= segments; i++) {
      const segmentAngle = offsetAngle + angle * (i / segments);
      const x = Math.cos(segmentAngle) * radius;
      const z = Math.sin(segmentAngle) * radius;
      const normal = new THREE.Vector3(Math.cos(segmentAngle), 0, Math.sin(segmentAngle)).normalize();
      
      // Top vertex
      sideVertices.push(x, height / 2, z);
      sideNormals.push(normal.x, normal.y, normal.z);
      sideUvs.push(i / segments, 1);
      
      // Bottom vertex
      sideVertices.push(x, -height / 2, z);
      sideNormals.push(normal.x, normal.y, normal.z);
      sideUvs.push(i / segments, 0);
    
      if (i < segments) {
      const base = i * 2;
        // First triangle
        sideTriangles.push(base, base + 1, base + 2);
        // Second triangle
        sideTriangles.push(base + 1, base + 3, base + 2);
      }
    }
    
    // Create cut face vertices (the exposed inner face)
    const cutVertices: number[] = [];
    const cutNormals: number[] = [];
    const cutUvs: number[] = [];
    const cutIndices: number[] = [];
    
    // First cut face (at start angle)
    const startX = Math.cos(offsetAngle) * radius;
    const startZ = Math.sin(offsetAngle) * radius;
    cutVertices.push(
      startX, height / 2, startZ,
      startX, -height / 2, startZ,
      0, height / 2, 0,
      0, -height / 2, 0
    );
    
    const startNormal = new THREE.Vector3(-Math.sin(offsetAngle), 0, Math.cos(offsetAngle)).normalize();
    for (let i = 0; i < 4; i++) {
      cutNormals.push(startNormal.x, startNormal.y, startNormal.z);
    }
    
    cutUvs.push(
      1, 1,
      1, 0,
      0, 1,
      0, 0
    );
    
    cutIndices.push(0, 1, 2, 1, 3, 2);
    
    // Second cut face (at end angle)
    const endX = Math.cos(offsetAngle + angle) * radius;
    const endZ = Math.sin(offsetAngle + angle) * radius;
    const baseIndex = cutVertices.length / 3;
    
    cutVertices.push(
      endX, height / 2, endZ,
      endX, -height / 2, endZ,
      0, height / 2, 0,
      0, -height / 2, 0
    );
    
    const endNormal = new THREE.Vector3(Math.sin(offsetAngle + angle), 0, -Math.cos(offsetAngle + angle)).normalize();
    for (let i = 0; i < 4; i++) {
      cutNormals.push(endNormal.x, endNormal.y, endNormal.z);
    }
    
    cutUvs.push(
      1, 1,
      1, 0,
      0, 1,
      0, 0
    );
    
    cutIndices.push(
      baseIndex + 0, baseIndex + 1, baseIndex + 2,
      baseIndex + 1, baseIndex + 3, baseIndex + 2
    );
    
    // Combine all geometry data
    vertices.push(...topVertices, ...sideVertices, ...cutVertices);
    normals.push(...topNormals, ...sideNormals, ...cutNormals);
    uvs.push(...topUvs, ...sideUvs, ...cutUvs);
    
    const topIndexOffset = 0;
    const sideIndexOffset = topVertices.length / 3;
    const cutIndexOffset = sideIndexOffset + sideVertices.length / 3;
    
    indices.push(
      ...topIndices,
      ...sideTriangles.map(i => i + sideIndexOffset),
      ...cutIndices.map(i => i + cutIndexOffset)
    );
    
    // Set geometry attributes
    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    this.setIndex(indices);
    
    // Compute vertex normals for better lighting
    this.computeVertexNormals();
  }
}

/**
 * Helper class for creating circular sectors (top view of slice)
 */
class CircularSectorBufferGeometry extends THREE.BufferGeometry {
  constructor(radius: number, startAngle: number, angle: number, segments: number = 128) {
    super();
    
    const vertices = [];
    const indices = [];
    const uvs = [];
    const normals = [];
    
    // Center vertex
    vertices.push(0, 0, 0);
    uvs.push(0.5, 0.5);
    normals.push(0, 1, 0);
    
    // Create vertices for the sector
    for (let i = 0; i <= segments; i++) {
      const segment = startAngle + (angle * i / segments);
      const x = Math.cos(segment) * radius;
      const z = Math.sin(segment) * radius;
      
      vertices.push(x, 0, z);
      normals.push(0, 1, 0);
      
      // Optimized UV mapping
      const u = 0.5 + (Math.cos(segment) * 0.5);
      const v = 0.5 + (Math.sin(segment) * 0.5);
      uvs.push(u, v);
      
      if (i > 0) {
        indices.push(0, i, i + 1);
      }
    }
    
    // Add a single edge layer for crisp edges
    const edgeRadius = radius - 0.001;
    for (let i = 0; i <= segments; i++) {
      const segment = startAngle + (angle * i / segments);
      const x = Math.cos(segment) * edgeRadius;
      const z = Math.sin(segment) * edgeRadius;
      
      vertices.push(x, 0, z);
      normals.push(0, 1, 0);
      
      // Slightly offset UVs for edge layer
      const u = 0.5 + (Math.cos(segment) * 0.49);
      const v = 0.5 + (Math.sin(segment) * 0.49);
      uvs.push(u, v);
    }
    
    // Add edge triangles
    for (let i = 0; i < segments; i++) {
      const base = segments + 1;
      indices.push(i + 1, base + i, base + i + 1);
      indices.push(i + 1, base + i + 1, i + 2);
    }
    
    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    this.setIndex(indices);
    
    // Compute vertex normals for better lighting
    this.computeVertexNormals();
  }
}

/**
 * CakeConfiguratorComponent - Main component for the 3D cake design interface
 * Handles the cake customization, 3D rendering, and order processing
 */
@Component({
  selector: 'app-cake-configurator',
  templateUrl: './cake-configurator.component.html',
  styleUrls: ['./cake-configurator.component.css']
})
export class CakeConfiguratorComponent implements OnInit, AfterViewInit, OnDestroy {
  // Reference to the canvas element for Three.js rendering
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js related properties
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  public controls!: OrbitControls;
  private animationFrameId!: number;
  private cakeParts: (THREE.Mesh | THREE.Group)[] = [];
  private resizeObserver!: ResizeObserver;
  private textureLoader = new TextureLoader();
  private pmremGenerator!: PMREMGenerator;
  private envMap!: THREE.Texture;
  
  /**
   * Material definitions for different cake flavors and frostings
   * Each material is configured with specific color and surface properties
   */
  private cakeMaterials: CakeMaterials = {
    vanille: new THREE.MeshStandardMaterial({ 
      color: 0xfff3e0,
      roughness: 0.3,
      metalness: 0.1
    }),
    chocolat: new THREE.MeshStandardMaterial({ 
      color: 0x8B5E3C,
      roughness: 0.3,
      metalness: 0.1
    }),
    pistache: new THREE.MeshStandardMaterial({ 
      color: 0xaed4a3,
      roughness: 0.3,
      metalness: 0.1
    }),
    caramel: new THREE.MeshStandardMaterial({ 
      color: 0xe6a06c,
      roughness: 0.3,
      metalness: 0.1
    }),
    redvelvet: new THREE.MeshStandardMaterial({ 
      color: 0xcc2c44,
      roughness: 0.3,
      metalness: 0.1
    }),
    fondant: new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1
    }),
    ganache: new THREE.MeshStandardMaterial({ 
      color: 0x2c1810,
      roughness: 0.2,
      metalness: 0.1
    }),
    creme: new THREE.MeshStandardMaterial({ 
      color: 0xfff9ea,
      roughness: 0.2,
      metalness: 0.1
    })
  };

  // Utility properties
  readonly Math = Math;
  isLoading = false;
  isCommandeLoading = false; // Loading state for Commander button
  isCommandeModalOpen = false; // Modal state for commande confirmation
  lastCommandeData: any = null; // Store last sent commande data

  // Form and design state
  cakeForm: FormGroup;
  currentDesign: CakeDesign = {
    patisserieId: 'custom-cake-' + Math.random().toString(36).substring(2, 9),
    nombrePersonnes: null,
    glacage: null,
    telephone: '',
    couches: [
      { saveur: 'vanille', epaisseur: 3 },
      { saveur: 'chocolat', epaisseur: 3 },
      { saveur: 'pistache', epaisseur: 3 }
    ]
  };

  // Cache for reusable geometries and materials
  private cachedGeometries: { [key: string]: THREE.BufferGeometry } = {};
  private cachedMaterials: { [key: string]: THREE.Material } = {};
  private baseLight!: THREE.DirectionalLight;
  private fillLight!: THREE.AmbientLight;

  offerDetails: any = null;
  private offerId: string | null = null;

  /**
   * Constructor - Initializes the form with validators
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cakeOfferService: CakeOfferService,
    private http: HttpClient
  ) {
    this.cakeForm = this.fb.group({
      nombrePersonnes: [null, Validators.required],
      glacage: [null, Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^\\+212[0-9]{9}$')]]
    });
  }

  /**
   * Lifecycle hook - Initializes form validation on component initialization
   */
  ngOnInit(): void {
    this.setupFormValidation();
    this.offerId = this.route.snapshot.paramMap.get('offerId');
    if (this.offerId) {
      this.cakeOfferService.getOfferDetails(this.offerId).subscribe(
        (details: any) => {
          this.offerDetails = details;
        },
        (error: any) => {
          console.error('Failed to fetch offer details:', error);
        }
      );
    }
  }

  /**
   * Lifecycle hook - Sets up Three.js scene and starts animation after view initialization
   */
  ngAfterViewInit(): void {
    this.initializeThreeJS();
    this.setupResizeObserver();
    this.animate();
  }

  /**
   * Lifecycle hook - Cleans up resources when component is destroyed
   */
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Clean up Three.js resources
    Object.values(this.cachedGeometries).forEach(geometry => geometry.dispose());
    Object.values(this.cachedMaterials).forEach(material => material.dispose());
    Object.values(this.cakeMaterials).forEach(material => material.dispose());
    
    this.renderer.dispose();
  }

  /**
   * Initializes the Three.js scene with all necessary components
   * Sets up the 3D environment for cake visualization
   */
  private initializeThreeJS(): void {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container) return;

    // Scene setup with consistent background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf9f7f5);

    // Camera setup
    const aspectRatio = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 100);
    const initialDistance = 10; // Increased distance for less zoom
    this.camera.position.set(
      initialDistance * Math.cos(Math.PI / 6),
      initialDistance * 0.35, // Lowered height
      initialDistance * Math.sin(Math.PI / 6)
    );

    // Optimized renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Controls setup
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 8; // Increased min distance
    this.controls.maxDistance = 18; // Increased max distance
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = Math.PI * 0.6;
    this.controls.minPolarAngle = 0;
    this.controls.target.set(0, 1, 0);
    this.controls.update();

    // Initialize consistent lighting
    this.setupLighting();

    // Initialize materials with consistent properties
    this.initializeMaterials();

    // Add initial plate
    this.addPlate();

    // Initial render
    this.updateCake();
  }

  private setupLighting(): void {
    // Ambient light for consistent base illumination
    this.fillLight = new THREE.AmbientLight(0xffffff, 0.12); // Further reduced intensity
    this.scene.add(this.fillLight);

    // Main directional light
    this.baseLight = new THREE.DirectionalLight(0xffffff, 0.28); // Further reduced intensity
    this.baseLight.position.set(5, 8, 5);
    this.baseLight.castShadow = true;
    
    // Enhanced shadow settings
    this.baseLight.shadow.mapSize.width = 2048;
    this.baseLight.shadow.mapSize.height = 2048;
    this.baseLight.shadow.camera.near = 0.5;
    this.baseLight.shadow.camera.far = 25;
    this.baseLight.shadow.bias = -0.0001;
    this.baseLight.shadow.radius = 2;
    
    const shadowSize = 10;
    this.baseLight.shadow.camera.left = -shadowSize;
    this.baseLight.shadow.camera.right = shadowSize;
    this.baseLight.shadow.camera.top = shadowSize;
    this.baseLight.shadow.camera.bottom = -shadowSize;
    
    this.scene.add(this.baseLight);

    // Add rim light for better plate definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.07); // Further reduced intensity
    rimLight.position.set(-5, 3, -5);
    this.scene.add(rimLight);
  }

  private initializeMaterials(): void {
    // Initialize materials with consistent properties
    const materialProperties = {
      metalness: 0.1,
      envMapIntensity: 0.2,
      shadowSide: THREE.FrontSide,
      dithering: true
    };

    // Create and cache materials
    this.cakeMaterials = {
      vanille: new THREE.MeshStandardMaterial({ 
        color: 0xfff3e0,
        roughness: 0.3,
        ...materialProperties
      }),
      chocolat: new THREE.MeshStandardMaterial({ 
        color: 0x8B5E3C,
        roughness: 0.3,
        ...materialProperties
      }),
      pistache: new THREE.MeshStandardMaterial({ 
        color: 0xaed4a3,
        roughness: 0.3,
        ...materialProperties
      }),
      caramel: new THREE.MeshStandardMaterial({ 
        color: 0xe6a06c,
        roughness: 0.3,
        ...materialProperties
      }),
      redvelvet: new THREE.MeshStandardMaterial({ 
        color: 0xcc2c44,
        roughness: 0.3,
        ...materialProperties
      }),
      fondant: new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.2,
        ...materialProperties
      }),
      ganache: new THREE.MeshStandardMaterial({ 
        color: 0x2c1810,
        roughness: 0.2,
        ...materialProperties
      }),
      creme: new THREE.MeshStandardMaterial({ 
        color: 0xfff9ea,
        roughness: 0.2,
        ...materialProperties
      })
    };
  }

  private addPlate(): void {
    // Create plate geometries if not cached
    const plateRadius = 3.8; // Decreased overall plate radius
    const bottomRadius = 2.4; // Decreased bottom support radius
    
    if (!this.cachedGeometries['plateBase']) {
      // Main plate surface - thinner and smaller
      this.cachedGeometries['plateBase'] = new THREE.CylinderGeometry(
        plateRadius, // top radius
        plateRadius, // bottom radius
        0.05, // thinner height
        64, // radial segments for smoother edge
        2, // height segments
        false // open-ended
      );
    }

    if (!this.cachedGeometries['plateRim']) {
      // Raised rim - proportional to new size
      this.cachedGeometries['plateRim'] = new THREE.TorusGeometry(
        plateRadius, // radius
        0.15, // tube radius
        20, // tubular segments
        64, // radial segments
        Math.PI * 2 // arc
      );
    }

    if (!this.cachedGeometries['plateBottom']) {
      // Bottom support ring - proportionally smaller
      this.cachedGeometries['plateBottom'] = new THREE.CylinderGeometry(
        bottomRadius, // top radius
        bottomRadius + 0.25, // bottom radius (slightly wider)
        0.3, // height
        64, // radial segments
        1, // height segments
        false // open-ended
      );
    }

    // Create and cache plate materials if not exists
    if (!this.cachedMaterials['plate']) {
      this.cachedMaterials['plate'] = new THREE.MeshStandardMaterial({
        color: 0xD4D6D8, // Fresh silver-gray color
        roughness: 0.2, // Smoother surface for more shine
        metalness: 0.7, // More metallic for fresh appearance
        envMapIntensity: 1.2, // Enhanced reflections
        flatShading: false
      });
    }

    // Create plate group
    const plateGroup = new THREE.Group();

    // Create base plate
    const basePlate = new THREE.Mesh(
      this.cachedGeometries['plateBase'],
      this.cachedMaterials['plate']
    );
    basePlate.receiveShadow = true;
    basePlate.castShadow = true;
    plateGroup.add(basePlate);

    // Add raised rim
    const rim = new THREE.Mesh(
      this.cachedGeometries['plateRim'],
      this.cachedMaterials['plate']
    );
    rim.position.y = 0.05; // Align with base plate height
    rim.receiveShadow = true;
    rim.castShadow = true;
    plateGroup.add(rim);
      
    // Add bottom support
    const bottom = new THREE.Mesh(
      this.cachedGeometries['plateBottom'],
      this.cachedMaterials['plate']
    );
    bottom.position.y = -0.17; // Position below base plate
    bottom.receiveShadow = true;
    bottom.castShadow = true;
    plateGroup.add(bottom);

    // Position the entire plate group
    plateGroup.position.y = 0.17; // Lift slightly to account for bottom support

    // Add to scene and track
    this.scene.add(plateGroup);
    this.cakeParts.push(plateGroup);

    // Update lighting for fresh metallic appearance
    if (this.baseLight) {
      this.baseLight.intensity = 1.1;
      this.baseLight.position.set(5, 8, 5);
    }
    if (this.fillLight) {
      this.fillLight.intensity = 0.5;
    }
  }

  /**
   * Updates the 3D cake model with enhanced materials and effects
   */
  private async updateCake(): Promise<void> {
    this.isLoading = true;
    
    // Remove old parts but keep the plate
    const plate = this.cakeParts.find(part => 
      part instanceof THREE.Group && 
      part.children.length === 3 && // Plate group has 3 components
      part.children[0] instanceof THREE.Mesh &&
      (part.children[0] as THREE.Mesh).geometry === this.cachedGeometries['plateBase']
    );
    
    this.cakeParts.forEach(part => {
      if (part !== plate) {
        this.scene.remove(part);
        if (part instanceof THREE.Mesh) {
          const material = part.material as THREE.MeshStandardMaterial;
          if (!Object.values(this.cakeMaterials).includes(material)) {
            material.dispose();
          }
          if (!Object.values(this.cachedGeometries).includes(part.geometry)) {
            part.geometry.dispose();
          }
        }
      }
    });
    
    this.cakeParts = plate ? [plate] : [];

    // Ensure plate exists
    if (!plate) {
      this.addPlate();
    }

    const baseRadius = this.currentDesign.nombrePersonnes 
      ? Math.max(1.5, Math.min(2.5, this.currentDesign.nombrePersonnes * 0.3))
      : 2;

    const heightMultiplier = 0.12;
    const totalHeight = this.currentDesign.couches.reduce((sum, layer) => sum + layer.epaisseur * heightMultiplier, 0);

    // Cache base cylinder geometry
    const cacheKey = `cylinder-${baseRadius}-${heightMultiplier}`;
    if (!this.cachedGeometries[cacheKey]) {
      this.cachedGeometries[cacheKey] = new THREE.CylinderGeometry(
        baseRadius,
        baseRadius,
        heightMultiplier,
        32,
        1
      );
    }

      if (this.currentDesign.glacage) {
      // Constants for slice geometry
      const fullCircle = Math.PI * 2;
      const sliceAngle = Math.PI / 2; // 90-degree slice for cleaner rectangular cut
      const remainingAngle = fullCircle - sliceAngle;
      const cameraDistance = Math.max(8, baseRadius * 2.5); // Reduced multiplier
      
      // Optimize renderer settings
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.autoUpdate = false; // Update shadows only when needed
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Create shared geometries
      const plateGeometry = new THREE.CylinderGeometry(
        baseRadius * 1.5,
        baseRadius * 1.5,
        0.1,
        32  // Reduced segments for better performance
      );
      
        const mainCakeGeometry = new THREE.CylinderGeometry(
          baseRadius,
          baseRadius,
          totalHeight,
        32,  // Reduced segments
        1,
        false,
        sliceAngle,
        remainingAngle
        );
        
      const layerGeometry = new THREE.PlaneGeometry(baseRadius, 1); // Will be scaled for height
      
      // Create and reuse materials
      const plateMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xE0E0E0,
        roughness: 0.3,
        metalness: 0.2
      });
      
      // Create plate
      const plate = new THREE.Mesh(plateGeometry, plateMaterial);
      plate.position.y = 0;
      plate.receiveShadow = true;
      this.scene.add(plate);
      this.cakeParts.push(plate);
      
      // Create main cake body
      const frostingMaterial = this.cakeMaterials[this.currentDesign.glacage].clone();
      frostingMaterial.needsUpdate = true;
        
        const mainCake = new THREE.Mesh(mainCakeGeometry, frostingMaterial);
      mainCake.position.y = totalHeight / 2 + 0.05;
        mainCake.castShadow = true;
        mainCake.receiveShadow = true;
        
        this.scene.add(mainCake);
        this.cakeParts.push(mainCake);
        
      // Create cut faces with optimized geometry
      const createCutFace = (angle: number) => {
        const cutGroup = new THREE.Group();
        let currentHeight = 0.05;

        // Create shared line geometry for dotted lines
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
          0, 0, 0,
          0, 1, 0  // Will be scaled for height
        ], 3));
        
        const lineMaterial = new THREE.LineDashedMaterial({
          color: 0xFFFFFF,
          dashSize: 0.1,
          gapSize: 0.1,
          opacity: 0.5,
          transparent: true
        });
        
        for (const layer of this.currentDesign.couches) {
          const layerHeight = layer.epaisseur * heightMultiplier;
          
          // Reuse layer geometry with scaling
          const face = new THREE.Mesh(layerGeometry, this.cakeMaterials[layer.saveur]);
          face.scale.y = layerHeight;
          face.rotation.y = angle;
          face.position.set(
            Math.cos(angle) * baseRadius / 2,
            currentHeight + layerHeight / 2,
            Math.sin(angle) * baseRadius / 2
          );
          
          // Add dotted line with scaling
          const line = new THREE.Line(lineGeometry, lineMaterial);
          line.scale.y = layerHeight;
          line.computeLineDistances();
          line.position.copy(face.position);
          line.rotation.y = angle;
          
          cutGroup.add(face);
          cutGroup.add(line);
          
          currentHeight += layerHeight;
        }
        
        return cutGroup;
      };
      
      // Add cut faces
      const cutFace1 = createCutFace(sliceAngle);
      const cutFace2 = createCutFace(0);
      
      this.scene.add(cutFace1, cutFace2);
      this.cakeParts.push(cutFace1, cutFace2);
      
      // Optimize lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.09); // Further reduced intensity
      this.scene.add(ambientLight);
      
      const mainLight = new THREE.DirectionalLight(0xffffff, 0.22); // Further reduced intensity
      mainLight.position.set(5, 5, 5);
      mainLight.castShadow = true;
      
      // Optimize shadow map
      mainLight.shadow.mapSize.width = 512;  // Reduced shadow map size
      mainLight.shadow.mapSize.height = 512;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 25;
      mainLight.shadow.bias = -0.001;
      
      this.scene.add(mainLight);
      
      // Adjust camera for proper view of the cake
      const sideView = {
        position: new THREE.Vector3(
          cameraDistance * Math.cos(Math.PI / 6),
          cameraDistance * 0.28, // Lowered height
          cameraDistance * Math.sin(Math.PI / 6)
        ),
        target: new THREE.Vector3(0, totalHeight / 3, 0) // Lower target point
      };
      
      // Update camera and controls
      this.camera.position.copy(sideView.position);
      this.controls.target.copy(sideView.target);
      this.controls.minDistance = 9; // Increased min distance
      this.controls.maxDistance = 18; // Increased max distance
      this.controls.update();
        
      // Force shadow map update
      this.renderer.shadowMap.needsUpdate = true;
      } else {
      // Create regular stacked layers
      let currentHeight = 0.05; // Start slightly above the plate
        
        for (const layer of this.currentDesign.couches) {
          const layerHeight = layer.epaisseur * heightMultiplier;
          
        const geometry = this.cachedGeometries[cacheKey];
        const material = this.cakeMaterials[layer.saveur];
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.scale.y = layer.epaisseur;
          mesh.position.y = currentHeight + layerHeight / 2;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          this.scene.add(mesh);
          this.cakeParts.push(mesh);
          
          currentHeight += layerHeight;
      }
    }

    // Update camera and controls
    const cameraHeight = Math.max(2, totalHeight);
    this.controls.target.set(0, cameraHeight / 2, 0);
    this.controls.update();
    
    this.isLoading = false;
  }

  /**
   * Creates a texture that simulates fresh cake texture with no mipmapping
   */
  private createFreshTexture(size: number): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      const stride = i * 4;
      
      const moisture = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 15;
      const freshness = Math.random() > 0.9 ? 30 : 0;
      const value = 128 + moisture + freshness;
      
      data[stride] = value;
      data[stride + 1] = value;
      data[stride + 2] = value;
      data[stride + 3] = 255;
    }
    
    const texture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.LinearFilter,
      THREE.LinearFilter
    );
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Adds realistic drips for ganache or cream frosting
   */
  private addGlacageDrips(group: THREE.Group, baseRadius: number, totalHeight: number, sliceAngle: number): void {
    const dripCount = 8 + Math.floor(Math.random() * 5);
    const angleStep = sliceAngle / dripCount;
    
    const dripsGroup = new THREE.Group();
    
    for (let i = 0; i < dripCount; i++) {
      const angle = Math.PI / 2 - sliceAngle / 2 + i * angleStep;
      const dripLength = 0.3 + Math.random() * 0.5;
      
      const dripGeometry = new THREE.CylinderGeometry(
        0.05, 
        0.1, 
        dripLength, 
        8, 
        1, 
        true
      );
      
      dripGeometry.rotateX(Math.PI / 2);
      dripGeometry.translate(
        Math.cos(angle) * baseRadius,
        totalHeight - dripLength / 2,
        Math.sin(angle) * baseRadius
      );
      
      const dripMaterial = this.cakeMaterials[this.currentDesign.glacage!].clone();
      dripMaterial.color.offsetHSL(0, 0, -0.1);
      
      const drip = new THREE.Mesh(dripGeometry, dripMaterial);
      dripsGroup.add(drip);
    }
    
    group.add(dripsGroup);
  }

  /**
   * Sets up form validation rules and subscriptions
   */
  private setupFormValidation(): void {
    this.cakeForm.valueChanges.subscribe(() => {
      this.updateFormValidity();
    });
  }

  /**
   * Updates form validity based on current design state
   */
  private updateFormValidity(): void {
    const peopleValid = this.currentDesign.nombrePersonnes !== null;
    const glacageValid = this.currentDesign.glacage !== null;
    const phoneValid = this.cakeForm.get('telephone')?.valid;
    
    if (!peopleValid || !glacageValid || !phoneValid) {
    this.cakeForm.setErrors({
      ...(!peopleValid && { peopleRequired: true }),
      ...(!glacageValid && { glacageRequired: true }),
      ...(!phoneValid && { phoneInvalid: true })
    });
    } else {
      this.cakeForm.setErrors(null); // Clear errors when valid
    }
  }

  /**
   * Sets up observer for canvas resize events
   */
  private setupResizeObserver(): void {
    const container = this.canvasRef.nativeElement.parentElement;
    if (!container) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.onWindowResize();
    });
    this.resizeObserver.observe(container);
  }

  /**
   * Handles the animation loop for Three.js rendering
   */
  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    if (this.controls) {
      this.controls.update();
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Handles window resize events
   */
  onWindowResize(): void {
    if (!this.canvasRef || !this.camera || !this.renderer) return;

    const container = this.canvasRef.nativeElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  /**
   * Resets the camera view to default position
   */
  resetView(): void {
    if (this.controls && this.camera) {
      const totalHeight = this.currentDesign.couches.reduce((sum, layer) => sum + layer.epaisseur * 0.3, 0);
      this.controls.target.set(0, totalHeight / 2, 0);
      this.camera.position.set(10, totalHeight + 5, 10);
      this.controls.update();
    }
  }

  /**
   * Captures and downloads a screenshot of the current cake design
   */
  takeScreenshot(): void {
    const canvas = this.renderer.domElement;
    try {
      const link = document.createElement('a');
      link.download = 'mon-gateau-personnalise.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      this.showToast('Capture d\'écran téléchargée!');
    } catch (err) {
      this.showError('Impossible de télécharger la capture d\'écran');
    }
  }

  /**
   * Updates the number of people the cake is designed for
   * @param count - Number of people
   */
  selectPeople(count: number): void {
    this.currentDesign.nombrePersonnes = count;
    this.cakeForm.patchValue({ nombrePersonnes: count });
    this.updateCake();
  }

  /**
   * Adds a new layer to the cake design
   */
  addLayer(): void {
    if (this.currentDesign.couches.length < 5) {
      this.currentDesign.couches.push({ saveur: 'vanille', epaisseur: 3 });
      this.updateCake();
    }
  }

  /**
   * Removes a layer from the cake design
   * @param index - Index of the layer to remove
   */
  removeLayer(index: number): void {
    if (this.currentDesign.couches.length > 1) {
      this.currentDesign.couches.splice(index, 1);
      this.updateCake();
    }
  }

  /**
   * Updates a specific layer's properties
   * @param index - Index of the layer to update
   */
  updateLayer(index: number): void {
    this.updateCake();
  }

  /**
   * Sets the frosting type for the cake
   * Updates appearance and pricing
   * @param type - Type of frosting to apply, or null to remove frosting
   */
  selectGlacage(type: 'fondant' | 'ganache' | 'creme' | null): void {
    this.currentDesign.glacage = type;
    this.cakeForm.patchValue({ glacage: type });
    this.updateCake();
  }

  /**
   * Calculates the base price of the cake based on size
   * @returns The base price in DHS
   */
  calculateBasePrice(): number {
    if (!this.currentDesign.nombrePersonnes) return 0;
    
    const basePricePerPerson = 25;
    const discountTiers = [
      { min: 8, discount: 0.15 },
      { min: 6, discount: 0.1 },
      { min: 4, discount: 0.05 }
    ];
    
    const applicableTier = discountTiers.find(tier => 
      this.currentDesign.nombrePersonnes! >= tier.min
    );
    
    const discount = applicableTier ? applicableTier.discount : 0;
    return Math.round(
      this.currentDesign.nombrePersonnes * basePricePerPerson * (1 - discount)
    );
  }

  /**
   * Calculates the total price for all layers
   * @returns The layers price in DHS
   */
  calculateLayersPrice(): number {
    // Only layers beyond the third (index >= 3) are counted in the price
    return this.currentDesign.couches.slice(3).reduce((total, layer) => {
      const basePrice = 50;
      const thicknessMultiplier = layer.epaisseur / 3;
      let flavorMultiplier = 1;
      
      switch (layer.saveur) {
        case 'chocolat': flavorMultiplier = 1.2; break;
        case 'pistache': flavorMultiplier = 1.3; break;
        case 'caramel': flavorMultiplier = 1.2; break;
        case 'redvelvet': flavorMultiplier = 1.4; break;
      }
      
      return total + (basePrice * thicknessMultiplier * flavorMultiplier);
    }, 0);
  }

  /**
   * Calculates the price for the selected frosting
   * Different rates for each frosting type, returns 0 if no frosting
   * @returns Price in DHS
   */
  calculateGlacagePrice(): number {
    if (!this.currentDesign.glacage) return 0;
    switch (this.currentDesign.glacage) {
      case 'fondant': return 200;
      case 'ganache': return 150;
      case 'creme': return 100;
      default: return 0;
    }
  }

  /**
   * Calculates the total price of the cake
   * @returns The total price in DHS
   */
  calculateTotalPrice(): number {
    if (!this.currentDesign.nombrePersonnes || !this.offerDetails?.prix) return 0;
    
    // Calculate base price using offerDetails.prix
    const basePrice = this.offerDetails.prix * (this.currentDesign.nombrePersonnes / 2);
    
    // Add layers and frosting prices
    return basePrice + 
           this.calculateLayersPrice() + 
           this.calculateGlacagePrice();
  }

  /**
   * Saves the current cake design
   */
  saveDesign(): void {
    if (this.cakeForm.valid) {
      console.log('Saving design:', this.currentDesign);
      this.showToast('Design saved successfully!');
    } else {
      this.showError('Please complete all required fields');
    }
  }

  /**
   * Adds the current cake design to the shopping cart
   */
  addToCart(): void {
    if (this.cakeForm.valid) {
      console.log('Adding to cart:', this.currentDesign);
      this.showToast('Cake added to cart successfully!');
    } else {
      this.showError('Please complete all required fields');
    }
  }

  /**
   * Displays an error message to the user
   * @param message - The error message to display
   */
  showError(message: string): void {
    console.error(message);
    // Implement proper error display here
  }

  /**
   * Displays a toast notification to the user
   * @param message - The message to display
   */
  showToast(message: string): void {
    console.log(message);
    // Implement proper toast display here
  }

  /**
   * Rotates the cake view to the left
   * @param angle - Rotation angle in radians
   */
  rotateLeft(angle: number): void {
    this.controls.object.rotation.y += angle;
    this.controls.update();
  }

  /**
   * Rotates the cake view to the right
   * @param angle - Rotation angle in radians
   */
  rotateRight(angle: number): void {
    this.controls.object.rotation.y -= angle;
    this.controls.update();
  }

  /**
   * Zooms in the camera view
   * @param factor - Zoom factor
   */
  zoomIn(factor: number): void {
    this.controls.object.position.z *= factor;
    this.controls.update();
  }

  /**
   * Zooms out the camera view
   * @param factor - Zoom factor
   */
  zoomOut(factor: number): void {
    this.controls.object.position.z /= factor;
    this.controls.update();
  }

  /**
   * Adds decorative elements to the cake model
   * @param baseRadius - The base radius of the cake
   * @param totalHeight - The total height of the cake
   */
  private addDecorations(baseRadius: number, totalHeight: number): void {
    if (!this.currentDesign.glacage) return;

    // Add sprinkles for cream frosting
    if (this.currentDesign.glacage === 'creme') {
      const sprinkleCount = 50;
      const sprinkleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      
      for (let i = 0; i < sprinkleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = baseRadius * (0.7 + Math.random() * 0.3);
        const height = Math.random() * totalHeight;
        const color = new THREE.Color(
          Math.random() * 0xffffff
        );
        
        const sprinkleMaterial = new THREE.MeshStandardMaterial({ color });
        const sprinkle = new THREE.Mesh(sprinkleGeometry, sprinkleMaterial);
        
        sprinkle.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        
        this.scene.add(sprinkle);
        this.cakeParts.push(sprinkle);
      }
    }
    
    // Add chocolate shards for ganache
    if (this.currentDesign.glacage === 'ganache') {
      const shardCount = 15;
      for (let i = 0; i < shardCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = baseRadius + 0.2;
        const height = totalHeight * (0.5 + Math.random() * 0.5);
        const shardHeight = 0.5 + Math.random() * 0.5;
        const shardWidth = 0.1 + Math.random() * 0.2;
        
        const shardGeometry = new THREE.BoxGeometry(shardWidth, shardHeight, 0.05);
        const shardMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x3c1810,
          roughness: 0.2,
          metalness: 0.1
        });
        
        const shard = new THREE.Mesh(shardGeometry, shardMaterial);
        shard.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
        shard.rotation.y = angle;
        shard.rotation.z = Math.random() * 0.2 - 0.1;
        
        this.scene.add(shard);
        this.cakeParts.push(shard);
      }
    }
  }

  private createNormalMap(size: number): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      const stride = i * 4;
      
      // Create subtle surface variations
      const nx = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5 + 0.5;
      const ny = Math.cos(x * 0.1) * Math.sin(y * 0.1) * 0.5 + 0.5;
      const nz = 1.0;
      
      data[stride] = Math.floor(nx * 255);
      data[stride + 1] = Math.floor(ny * 255);
      data[stride + 2] = Math.floor(nz * 255);
      data[stride + 3] = 255;
    }
    
    const texture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  private createAOMap(size: number): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      const stride = i * 4;
      
      // Create subtle darkening at edges
      const distanceToEdge = Math.min(x, y, size - x, size - y) / (size * 0.1);
      const value = Math.min(255, Math.floor(distanceToEdge * 255));
      
      data[stride] = value;
      data[stride + 1] = value;
      data[stride + 2] = value;
      data[stride + 3] = 255;
    }
    
    const texture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  closeCommandeModal() {
    this.isCommandeModalOpen = false;
  }

  sendCommande(): void {
    if (!this.cakeForm.valid) {
      this.showError('Please complete all required fields');
      return;
    }

    // Sync telephone from form to currentDesign
    this.currentDesign.telephone = this.cakeForm.get('telephone')?.value;

    this.isCommandeLoading = true; // Start loading

    const data = {
      patisserieId: this.offerDetails.patisserie.id, // Only this from offerDetails
      offerId: this.offerId, // Add offerId from the route
      nombrePersonnes: this.currentDesign.nombrePersonnes,
      glacage: this.currentDesign.glacage,
      telephone: this.currentDesign.telephone, // From configurator input
      couches: this.currentDesign.couches.map(layer => ({
        saveur: layer.saveur,
        epaisseur: layer.epaisseur
      }))
    };

    this.http.post('http://localhost:8080/api/commandes', data).subscribe({
      next: (response) => {
        console.log('Commande API response:', response);
        this.lastCommandeData = data;
        this.isCommandeModalOpen = true;
        this.showToast('Commande envoyée avec succès !');
        this.isCommandeLoading = false; // Stop loading
        // Optionally, reset the form or redirect
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi de la commande:', err);
        if (err.status === 0) {
          this.showError('Impossible de contacter le serveur.');
        } else if (err.error && err.error.message) {
          this.showError('Erreur: ' + err.error.message);
        } else {
          this.showError('Erreur lors de l\'envoi de la commande');
        }
        this.isCommandeLoading = false; // Stop loading on error
      }
    });
  }
}