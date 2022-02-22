import './App.css'
import * as THREE from 'three'
import {useState, useEffect, useLayoutEffect} from 'react'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {BoxLineGeometry} from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import ThreeMeshUI from 'three-mesh-ui'
import {
  FaArrowUp,
  FaArrowLeft,
  FaArrowRight,
  FaArrowDown,
  FaMouse,
} from 'react-icons/fa'
import {atom, useAtom} from 'jotai'
import GLB from './all.glb'
import torchGLB from './torch1.glb'
import stand from './screenBase.glb'
import platorm from './buttonGlow.glb'
import {
  Text,
  Button,
  Flex,
  Box,
  Heading,
  Kbd,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import {useDisclosure} from '@chakra-ui/react'
import FontJSON from './assets/Roboto-msdf.json'
import FontImage from './assets/Roboto-msdf.png'
import {useMoralis, useERC20Balances, useNFTBalances} from 'react-moralis'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'

import stoneWall from './CliffJagged004_COL_VAR1_3K.jpg'
import stoneWallAO from './CliffJagged004_AO_3K.jpg'
import stoneWallDisp from './CliffJagged004_DISP_VAR2_3K.jpg'
import stoneWallNormalMap from './CliffJagged004_NRM_3K.jpg'

import groundImg from './GroundDirtRocky002_COL_3K.jpg'
import groundImgAO from './GroundDirtRocky002_AO_3K.jpg'
import groundImgDisp from './GroundDirtRocky002_DISP_3K.jpg'
import groundImgNormalMap from './GroundDirtRocky002_NRM_3K.jpg'
const openAtom = atom(true)
const changeAtom = atom(null, (get, set) => set(openAtom, !get(openAtom)))
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
mouse.x = mouse.y = null

window.addEventListener('pointermove', (event) => {
  mouse.x = 0
  mouse.y = 0
})

window.addEventListener('pointerdown', () => {
  selectState = true
})

window.addEventListener('pointerup', () => {
  selectState = false
})

window.addEventListener('touchstart', (event) => {
  selectState = true
  mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
})

window.addEventListener('touchend', () => {
  selectState = false
  mouse.x = null
  mouse.y = null
})

let selectState = false
let camera, renderer, controls, vrControl
let meshContainer, meshes, currentMesh
let objsToTest = []
let currentID = 3
let rotationSign = 0.005

const scene = new THREE.Scene()
let skull
let skull2
let skull3
let skull4
let skull5
let torch
let torch2
let torch3
let container
let standMesh
let standMesh2
let platform
let skullAry = []
let claySkelly
let wallZ = 45
let leftCorridorX = -32.5
let rightCorridorX = 32.5
let keyCBool = true
//const gui = new dat.GUI({width: 800})
const loader = new GLTFLoader()

//wallImage.repeat.x = 2
//wallImage.repeat.y = 2
//wallImage.wrapS = THREE.RepeatWrapping
//wallImage.wrapT = THREE.RepeatWrapping

// Textures

const wallImage = new THREE.TextureLoader().load(stoneWall)
const AO = new THREE.TextureLoader().load(stoneWallAO)
const disp = new THREE.TextureLoader().load(stoneWallDisp)
const normalMap = new THREE.TextureLoader().load(stoneWallNormalMap)
const wallMaterial = new THREE.MeshStandardMaterial({
  map: wallImage,
})
wallMaterial.side = THREE.DoubleSide
wallMaterial.metalness = 0
wallMaterial.roughness = 1
wallMaterial.aoMap = AO
wallMaterial.aoMapIntensity = 10
wallMaterial.normalMap = normalMap

const groundImage = new THREE.TextureLoader().load(groundImg)
const groundImageAO = new THREE.TextureLoader().load(groundImgAO)
const groundImageDisp = new THREE.TextureLoader().load(groundImgDisp)
const groundImageNormalMap = new THREE.TextureLoader().load(groundImgNormalMap)
const groundMaterial = new THREE.MeshStandardMaterial({map: groundImage})
groundMaterial.normalMap = groundImageNormalMap
groundMaterial.aoMap = groundImageAO
groundMaterial.displacementMap = groundImageDisp
/* gui.add(wallMaterial, 'metalness').min(0).max(1).step(0.01)
gui.add(wallMaterial, 'roughness').min(0).max(1).step(0.01)
gui.add(wallMaterial, 'displacementScale').min(0).max(100).step(0.01)
gui.add(wallMaterial, 'aoMapIntensity').min(0).max(100).step(0.01) */

// Loading in the GLTF Files
loader.load(
  GLB,
  function (gltf) {
    claySkelly = gltf.scene
    claySkelly.scale.set(1.5, 1.5, 1.5)
    claySkelly.position.set(0, -8, -315)
    //claySkelly.rotation.y = 1.5708
    //torch.push(skull5)
    scene.add(claySkelly)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  torchGLB,
  function (gltf) {
    torch = gltf.scene
    torch.position.set(69, -3, -310)
    scene.add(torch)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  torchGLB,
  function (gltf) {
    torch2 = gltf.scene
    torch2.position.set(-69, -3, -310)
    scene.add(torch2)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  torchGLB,
  function (gltf) {
    torch3 = gltf.scene
    torch3.position.set(0, -3, -356.5)
    scene.add(torch3)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  stand,
  function (gltf) {
    standMesh = gltf.scene
    standMesh.position.set(-20, -9, -315)
    standMesh.scale.set(2, 2, 2)
    scene.add(standMesh)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  stand,
  function (gltf) {
    standMesh2 = gltf.scene
    standMesh2.position.set(20, -9, -315)
    standMesh2.scale.set(2, 2, 2)
    scene.add(standMesh2)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  platorm,
  function (gltf) {
    platform = gltf.scene
    platform.position.set(0, -9, -240)
    platform.scale.set(1.5, 1.5, 1.5)
    scene.add(platform)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)
function NavBar() {
  const {
    authenticate,
    isAuthenticated,
    logout,
    account,
    chainId,
    user,
    authError,
  } = useMoralis()
  let trucatedAccount =
    account?.substring(0, 6) +
    '...' +
    account?.substring(account.length - 4, account.length)
  console.log(account)
  return (
    <Flex
      position="fixed"
      borderColor="#5bdf5a"
      top="0"
      left="0"
      width="100%"
      h="70px"
      justify="space-between"
      align="center"
    >
      <Heading color="green" ml="20px">
        Avax Skullies
      </Heading>
      <Flex align="center">
        {isAuthenticated ? (
          <Text color="green" mr="20px">
            {trucatedAccount}
          </Text>
        ) : null}
        {isAuthenticated ? (
          <Button
            onClick={logout}
            borderColor="rgba(234,176,90,.1)"
            bg="#eab05a"
            mr="20px"
          >
            Logout
          </Button>
        ) : (
          <Button
            onClick={authenticate}
            borderColor="rgba(234,176,90,.1)"
            bg="#eab05a"
            mr="20px"
          >
            {' '}
            Login{' '}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

function App() {
  const [, setOpen] = useAtom(changeAtom)
  let moveForward = false
  let moveBackward = false
  let moveLeft = false
  let moveRight = false
  let canJump = false
  let open = false
  let controls
  let pastZNeg260 = false
  let sphereOnPlatform = false

  useLayoutEffect(() => {
    let prevTime = performance.now()
    const velocity = new THREE.Vector3()
    const direction = new THREE.Vector3()
    const vertex = new THREE.Vector3()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('myCanvas'),
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.position.setZ(-220)

    renderer.render(scene, camera)
    const boxGeometry = new THREE.BoxGeometry(40, 20, 3)
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
    const geometry = new THREE.PlaneGeometry(45, 20)

    const floorGeometry = new THREE.PlaneGeometry(20, 20)
    const smallerPlaneGeometry = new THREE.PlaneGeometry(20, 20)
    const sphereGeometry = new THREE.SphereGeometry(3)
    const sphere = new THREE.Mesh(sphereGeometry, wallMaterial)
    sphere.position.set(0, 0, -240)
    scene.add(sphere)

    const movingWall = new THREE.Mesh(boxGeometry, wallMaterial)
    movingWall.position.set(0, 0, -270.5)
    scene.add(movingWall)
    const floorMesh = new THREE.Mesh(floorGeometry, groundMaterial)
    function makeFloor() {
      let floorX = -260
      let floorZ = 40
      for (let i = 0; i < 520; i++) {
        if (floorZ < -360) {
          floorZ = 40
          floorX += 19.9
        }
        const floor = floorMesh.clone()
        floor.position.set(floorX, -10, floorZ)
        floor.rotation.y = Math.PI
        floor.rotation.z = Math.PI / 2
        floor.rotation.x = Math.PI / 2
        scene.add(floor)
        floorZ -= 19.99
      }
    }
    makeFloor()
    function makeTextPanel() {
      const container = new ThreeMeshUI.Block({
        width: 8,
        height: 10,
        padding: 0.05,
        //justifyContent: 'center',
        alignContent: 'center',
        fontFamily: FontJSON,
        fontTexture: FontImage,
      })

      container.position.set(-20, -2, -315)
      //container.rotation.x = -0.55
      scene.add(container)

      const container2 = new ThreeMeshUI.Block({
        width: 8,
        height: 10,
        padding: 0.05,
        //justifyContent: 'center',
        alignContent: 'center',
        fontFamily: FontJSON,
        fontTexture: FontImage,
      })

      container2.position.set(20, -2, -315)
      //container.rotation.x = -0.55q
      scene.add(container2)

      //

      container.add(
        new ThreeMeshUI.Text({
          content:
            'This collection features 100 ERC 721 tokens. Each Avatar is unique in its combination of attributes',
          fontSize: 1,
        }),
      )

      container2.add(
        new ThreeMeshUI.Text({
          content:
            'Each NFT Avatar is 1 AVAX and will grant the owner entry into the future SkulliesVerse',
          fontSize: 1,
        }),
      )
    }
    makeTextPanel()

    function makePanel() {
      // Container block, in which we put the two buttons.
      // We don't define width and height, it will be set automatically from the children's dimensions
      // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

      container = new ThreeMeshUI.Block({
        justifyContent: 'center',
        alignContent: 'center',
        contentDirection: 'row-reverse',
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11,
      })

      container.position.set(0, -8, -300)
      container.rotation.x = -0.9
      container.scale.set(20, 20, 20)
      scene.add(container)

      // BUTTONS

      // We start by creating objects containing options that we will use with the two buttons,
      // in order to write less code.

      const buttonOptions = {
        width: 0.4,
        height: 0.15,
        justifyContent: 'center',
        alignContent: 'center',
        offset: 0.05,
        margin: 0.02,
        borderRadius: 0.075,
      }

      // Options for component.setupState().
      // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

      const hoveredStateAttributes = {
        state: 'hovered',
        attributes: {
          offset: 0.035,
          backgroundColor: new THREE.Color(0x999999),
          backgroundOpacity: 1,
          fontColor: new THREE.Color(0xffffff),
        },
      }

      const idleStateAttributes = {
        state: 'idle',
        attributes: {
          offset: 0.035,
          backgroundColor: new THREE.Color(0x666666),
          backgroundOpacity: 0.3,
          fontColor: new THREE.Color(0xffffff),
        },
      }

      // Buttons creation, with the options objects passed in parameters.

      const buttonNext = new ThreeMeshUI.Block(buttonOptions)
      const buttonPrevious = new ThreeMeshUI.Block(buttonOptions)

      // Add text to buttons

      buttonNext.add(new ThreeMeshUI.Text({content: 'Mint'}))

      buttonPrevious.add(new ThreeMeshUI.Text({content: 'previous'}))

      // Create states for the buttons.
      // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

      const selectedAttributes = {
        offset: 0.02,
        backgroundColor: new THREE.Color(0x777777),
        fontColor: new THREE.Color(0x222222),
      }

      buttonNext.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {},
      })
      buttonNext.setupState(hoveredStateAttributes)
      buttonNext.setupState(idleStateAttributes)

      //

      buttonPrevious.setupState({
        state: 'selected',
        attributes: selectedAttributes,
        onSet: () => {},
      })
      buttonPrevious.setupState(hoveredStateAttributes)
      buttonPrevious.setupState(idleStateAttributes)

      //

      container.add(buttonNext)
      objsToTest.push(buttonNext)
    }

    makePanel()

    let createWalls = () => {
      let mintRoomFloorX = -60
      let mintRoomFloorZ = -290
      let mintRoomWallZ = -290
      let mintRoomBackWallX = -47.5
      const firstBackWall = new THREE.Mesh(geometry, wallMaterial)
      //firstBackWall.rotation.y = Math.PI / 2
      //firstBackWall.rotation.z = Math.PI / 2
      firstBackWall.position.set(0, 0, 50)
      scene.add(firstBackWall)

      const lastCeilingInFirstCorridor = new THREE.Mesh(
        smallerPlaneGeometry,
        wallMaterial,
      )
      lastCeilingInFirstCorridor.position.set(0, 10, -257.5)
      lastCeilingInFirstCorridor.rotation.y = Math.PI
      lastCeilingInFirstCorridor.rotation.z = Math.PI / 2
      lastCeilingInFirstCorridor.rotation.x = Math.PI / 2
      scene.add(lastCeilingInFirstCorridor)
      // wall bottom
      const lastFloorInFirstCorridor = new THREE.Mesh(
        smallerPlaneGeometry,
        groundMaterial,
      )
      const leftCorridorEndWall = new THREE.Mesh(geometry, wallMaterial)
      leftCorridorEndWall.rotation.y = Math.PI / 2
      leftCorridorEndWall.position.set(-220, 0, -260)
      scene.add(leftCorridorEndWall)
      //wall right
      const rightCorridorEndWall = new THREE.Mesh(geometry, wallMaterial)
      rightCorridorEndWall.rotation.y = Math.PI / 2
      rightCorridorEndWall.position.set(220, 0, -260)
      scene.add(rightCorridorEndWall)

      for (let i = 0; i < 7; i++) {
        // First corridor

        const leftWall = new THREE.Mesh(geometry, wallMaterial)
        leftWall.rotation.y = Math.PI / 2
        leftWall.position.set(-10, 0, wallZ)
        scene.add(leftWall)
        //wall right
        const rightWall = new THREE.Mesh(geometry, wallMaterial)
        rightWall.rotation.y = Math.PI / 2
        rightWall.position.set(10, 0, wallZ)
        scene.add(rightWall)
        // wall top
        const ceilingWall = new THREE.Mesh(geometry, wallMaterial)
        ceilingWall.position.set(0, 10, wallZ)
        ceilingWall.rotation.y = Math.PI
        ceilingWall.rotation.z = Math.PI / 2
        ceilingWall.rotation.x = Math.PI / 2
        scene.add(ceilingWall)
        // wall bottom
        /*  const floorWall = new THREE.Mesh(geometry, groundMaterial)
        floorWall.position.set(0, -10, wallZ)
        floorWall.rotation.y = Math.PI
        floorWall.rotation.z = Math.PI / 2
        floorWall.rotation.x = Math.PI / 2
        scene.add(floorWall) */

        wallZ = wallZ - 45
      }

      for (let i = 0; i < 5; i++) {
        // Left corridor Planes
        const leftCorridorRightWall = new THREE.Mesh(geometry, wallMaterial)
        leftCorridorRightWall.position.set(leftCorridorX, 0, -247.5)
        scene.add(leftCorridorRightWall)
        const leftCorridorLeftWall = new THREE.Mesh(geometry, wallMaterial)
        leftCorridorLeftWall.position.set(leftCorridorX, 0, -267.5)
        scene.add(leftCorridorLeftWall)
        /*  const leftCorridorFloorWall = new THREE.Mesh(geometry, groundMaterial)
        leftCorridorFloorWall.position.set(leftCorridorX, -10, -257.5)
        leftCorridorFloorWall.rotation.y = Math.PI
        leftCorridorFloorWall.rotation.z = Math.PI
        leftCorridorFloorWall.rotation.x = Math.PI / 2
        scene.add(leftCorridorFloorWall) */
        const leftCorridorCielingWall = new THREE.Mesh(geometry, wallMaterial)
        leftCorridorCielingWall.position.set(leftCorridorX, 10, -257.5)
        leftCorridorCielingWall.rotation.y = Math.PI
        leftCorridorCielingWall.rotation.z = Math.PI
        leftCorridorCielingWall.rotation.x = Math.PI / 2
        scene.add(leftCorridorCielingWall)

        // Right corridor Planes
        const rightCorridorLeftWall = new THREE.Mesh(geometry, wallMaterial)
        rightCorridorLeftWall.position.set(rightCorridorX, 0, -247.5)
        scene.add(rightCorridorLeftWall)
        const rightCorridorRightWall = new THREE.Mesh(geometry, wallMaterial)
        rightCorridorRightWall.position.set(rightCorridorX, 0, -267.5)
        scene.add(rightCorridorRightWall)
        /*   const rightCorridorFloorWall = new THREE.Mesh(geometry, groundMaterial)
        rightCorridorFloorWall.position.set(rightCorridorX, -10, -257.5)
        rightCorridorFloorWall.rotation.y = Math.PI
        rightCorridorFloorWall.rotation.z = Math.PI
        rightCorridorFloorWall.rotation.x = Math.PI / 2
        scene.add(rightCorridorFloorWall) */
        const rightCorridorCielingWall = new THREE.Mesh(geometry, wallMaterial)
        rightCorridorCielingWall.position.set(rightCorridorX, 10, -257.5)
        rightCorridorCielingWall.rotation.y = Math.PI
        rightCorridorCielingWall.rotation.z = Math.PI
        rightCorridorCielingWall.rotation.x = Math.PI / 2
        scene.add(rightCorridorCielingWall)

        leftCorridorX = leftCorridorX - 45
        rightCorridorX = rightCorridorX + 45
      }

      for (let i = 0; i < 15; i++) {
        if (i == 8) {
          mintRoomFloorX = -60
          mintRoomFloorZ = -335
        }
        /*       const mintRoomFloorPanel = new THREE.Mesh(geometry, groundMaterial)
        mintRoomFloorPanel.position.set(mintRoomFloorX, -10, mintRoomFloorZ)
        mintRoomFloorPanel.rotation.y = Math.PI
        mintRoomFloorPanel.rotation.z = Math.PI / 2
        mintRoomFloorPanel.rotation.x = Math.PI / 2
        scene.add(mintRoomFloorPanel) */
        const mintRoomCeilingPanel = new THREE.Mesh(geometry, wallMaterial)
        mintRoomCeilingPanel.position.set(mintRoomFloorX, 10, mintRoomFloorZ)
        mintRoomCeilingPanel.rotation.y = Math.PI
        mintRoomCeilingPanel.rotation.z = Math.PI / 2
        mintRoomCeilingPanel.rotation.x = Math.PI / 2
        scene.add(mintRoomCeilingPanel)
        mintRoomFloorX = mintRoomFloorX + 20
      }

      for (let i = 0; i < 2; i++) {
        const mintRoomLeftWall = new THREE.Mesh(geometry, wallMaterial)
        mintRoomLeftWall.position.set(-70, 0, mintRoomWallZ)
        mintRoomLeftWall.rotation.y = Math.PI / 2
        scene.add(mintRoomLeftWall)
        const mintRoomRightWall = new THREE.Mesh(geometry, wallMaterial)
        mintRoomRightWall.position.set(70, 0, mintRoomWallZ)
        mintRoomRightWall.rotation.y = Math.PI / 2
        scene.add(mintRoomRightWall)
        mintRoomWallZ = mintRoomWallZ - 45
      }

      for (let i = 0; i < 4; i++) {
        const mintRoomBackWall = new THREE.Mesh(geometry, wallMaterial)
        mintRoomBackWall.position.set(mintRoomBackWallX, 0, -357.5)
        scene.add(mintRoomBackWall)
        mintRoomBackWallX = mintRoomBackWallX + 45
      }
    }
    createWalls()

    function updateButtons() {
      // Find closest intersecting object

      let intersect

      if (renderer.xr.isPresenting) {
        vrControl.setFromController(0, raycaster.ray)

        intersect = raycast()

        // Position the little white dot at the end of the controller pointing ray
        if (intersect) vrControl.setPointerAt(0, intersect.point)
      } else if (mouse.x !== null && mouse.y !== null) {
        raycaster.setFromCamera(mouse, camera)

        intersect = raycast()
      }

      // Update targeted button state (if any)

      if (intersect && intersect.object.isUI) {
        if (selectState) {
          // Component.setState internally call component.set with the options you defined in component.setupState
          intersect.object.setState('selected')
        } else {
          // Component.setState internally call component.set with the options you defined in component.setupState
          intersect.object.setState('hovered')
        }
      }

      // Update non-targeted buttons state

      objsToTest.forEach((obj) => {
        if ((!intersect || obj !== intersect.object) && obj.isUI) {
          // Component.setState internally call component.set with the options you defined in component.setupState
          obj.setState('idle')
        }
      })
    }

    function raycast() {
      return objsToTest.reduce((closestIntersection, obj) => {
        const intersection = raycaster.intersectObject(obj, true)

        if (!intersection[0]) return closestIntersection

        if (
          !closestIntersection ||
          intersection[0].distance < closestIntersection.distance
        ) {
          intersection[0].object = obj

          return intersection[0]
        }

        return closestIntersection
      }, null)
    }
    /* 
    const plane2Seg3 = new THREE.Mesh(geometry, wallMaterial)
    //plane2Seg3.rotation.y = Math.PI / 2
    //plane2Seg3.rotation.z = Math.PI / 2
    plane2Seg3.position.set(0, 0, -37)
    scene.add(plane2Seg3) */

    const pointLight = new THREE.PointLight(0xb85b14, 2, 62, 1.5)
    const pointLight2 = new THREE.PointLight(0xb85b14, 2, 62, 1.5)
    const pointLightMintLeftWall = new THREE.PointLight(0xb85b14, 2, 62, 1.5)
    const pointLightMintRightWall = new THREE.PointLight(0xb85b14, 2, 62, 1.5)
    const pointLightMintBackWall = new THREE.PointLight(0xb85b14, 2, 62, 1.5)
    pointLightMintLeftWall.position.set(-67, 3, -310)
    pointLightMintRightWall.position.set(67, 3, -310)
    pointLightMintBackWall.position.set(0, 3, -355.5)
    scene.add(pointLightMintLeftWall)
    scene.add(pointLightMintRightWall)
    scene.add(pointLightMintBackWall)
    pointLight.position.set(10, 3, 15)
    pointLight2.position.set(-10, 3, 5)
    /*    gui.add(pointLight2, 'intensity').min(0).max(10).step(0.01)
    gui.add(pointLight2, 'distance').min(0).max(100).step(0.01)
    gui.add(pointLight2, 'decay').min(0).max(10).step(0.01) */
    const ambientLight = new THREE.AmbientLight(0xb85b14)
    //scene.add(ambientLight)
    scene.add(pointLight)
    scene.add(pointLight2)

    /*   const cube = new THREE.Mesh(
      new THREE.BoxGeometry(100, 20, 25, 10, 10, 10),
      wallMaterial,
    )
  
    cube.geometry.setAttribute(
      'uv2',
      new THREE.Float32BufferAttribute(cube.geometry.attributes.uv.array, 2),
    )
    cube.rotation.y = 1.5708 */
    //scene.add(cube)

    const world = new CANNON.World()
    //const planeShape = new CANNON.Plane(44, 20)
    world.gravity.set(0, -9.8, 0)
    const defualtMaterial = new CANNON.Material('defaultMaterial')
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defualtMaterial,
      defualtMaterial,
      {friction: 0.3, restitution: 0.3},
    )
    world.addContactMaterial(defaultContactMaterial)
    world.defaultContactMaterial = defaultContactMaterial
    const planeShape = new CANNON.Plane()
    const wallShape = new CANNON.Box(new CANNON.Vec3(3, 3, 3))
    const sphereShape = new CANNON.Sphere(4)
    const sphereShape2 = new CANNON.Sphere(5)
    /*   const boxShape = new CANNON.Box(new CANNON.Vec3(3, 3, 3))
    const boxBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, -5, -240),
      isTrigger: true,
    })
    world.addBody(boxBody) */
    const sphereBody = new CANNON.Body({
      mass: 20,
      position: new CANNON.Vec3(40, 0, -255),
      shape: sphereShape,
    })
    sphereBody.linearDamping = 0.3
    sphereBody.angularDamping = 0.3

    const sphereBody2 = new CANNON.Body({
      mass: 10,
      position: new CANNON.Vec3(0, 0, -230),
      shape: sphereShape2,
    })
    sphereBody2.linearDamping = 0.3
    sphereBody2.angularDamping = 0.3
    world.addBody(sphereBody2)
    world.addBody(sphereBody)
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.position.set(0, -9.9, -250)
    floorBody.addShape(planeShape)
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5,
    )
    world.addBody(floorBody)

    //world.addBody(wallBody2)

    // const room = new THREE.LineSegments(
    //   new BoxLineGeometry(6, 4, 80, 10, 10, 10).translate(0, 1, 1.5),
    //   material,
    // )

    // const roomMesh = new THREE.Mesh(
    //   new THREE.BoxGeometry(6, 4, 6, 10, 10, 10).translate(0, 1, 1.5),
    //   new THREE.MeshBasicMaterial({side: THREE.BackSide}),
    // )

    //scene.add(room)

    //const gridHelper = new THREE.GridHelper(200, 50)
    const lightHelper = new THREE.PointLightHelper(pointLight)
    //scene.add(lightHelper)
    const lightHelper2 = new THREE.PointLightHelper(pointLight2)
    //scene.add(lightHelper2)
    controls = new PointerLockControls(camera, document.body)
    window.addEventListener('click', function (e) {
      if (e.button === 0) {
        //Left click
        controls.lock()
        console.log('left click')
      } else {
        //Right click
        controls.unlock()
        console.log('right click')
      }
      //console.log(e.button)
    })

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    controls.addEventListener('lock', function () {})
    /*  box.addEventListener('collide', (e) => {
      console.log(e)
    }) */

    world.addEventListener('endContact', (event) => {
      console.log('the contact has ended')
    })

    scene.add(controls.getObject())

    function animate() {
      requestAnimationFrame(animate)

      const time = performance.now()

      const delta = (time - prevTime) / 1000

      velocity.x -= velocity.x * 10.0 * delta
      velocity.z -= velocity.z * 10.0 * delta
      velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass
      direction.z = Number(moveForward) - Number(moveBackward)
      direction.x = Number(moveRight) - Number(moveLeft)
      direction.normalize() // this ensures consistent movements in all directions
      if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta
      velocity.y = Math.max(0, velocity.y)
      canJump = true
      controls.moveRight(-velocity.x * delta)
      controls.moveForward(-velocity.z * delta)

      pointLight.position.x = camera.position.x
      pointLight.position.y = camera.position.y
      pointLight.position.z = camera.position.z

      sphereBody2.position.copy(camera.position)
      sphereBody2.quaternion.x = camera.quaternion.x
      sphereBody2.quaternion.y = camera.quaternion.y
      sphereBody2.quaternion.z = camera.quaternion.z
      sphereBody2.quaternion.w = camera.quaternion.w
      sphere.position.copy(sphereBody.position)
      //sphere.rotation.copy(sphereBody.quaternion)
      sphere.quaternion.x = sphereBody.quaternion.x
      sphere.quaternion.y = sphereBody.quaternion.y
      sphere.quaternion.z = sphereBody.quaternion.z
      sphere.quaternion.w = sphereBody.quaternion.w

      // Open the door when Camera or Sphere is on the platform
      if (
        camera.position.x > -5 &&
        camera.position.x < 5 &&
        camera.position.z > -244 &&
        camera.position.z < -238
      ) {
        //console.log(' inside the bounding box')

        if (movingWall.position.x > -35) {
          movingWall.position.x -= 0.1
        }
      } else if (
        sphereBody.position.x > -5 &&
        sphere.position.x < 5 &&
        sphere.position.z > -244 &&
        sphere.position.z < -238
      ) {
        //console.log(' inside the bounding box')
        sphereOnPlatform = true
        if (movingWall.position.x > -35) {
          movingWall.position.x -= 0.1
        }
      } else {
        sphereOnPlatform = false
        if (movingWall.position.x < 0) {
          movingWall.position.x += 0.2
        }
      }

      //stop the player from going through the wall on the left side when past z = -250
      if (camera.position.x < -10 && camera.position.z >= -250) {
        camera.position.z = -250
        //camera.position.x = camera.position.x
      }
      // stop the player from going through the wall on the right side when past z = -250
      if (camera.position.x > 10 && camera.position.z >= -250) {
        camera.position.z = -250
        //camera.position.x = camera.position.x
      }
      // flips a boolean value depending on whether the player in the Mintroom
      // the value then used to restrict the player from moving through the wall
      if (camera.position.z < -269) {
        pastZNeg260 = true
      } else {
        pastZNeg260 = false
      }
      if (pastZNeg260 == true) {
        // stop camera from going through front wall of Mint Room
        if (
          (camera.position.x >= 10 || camera.position.x <= -10) &&
          camera.position.z > -271
        ) {
          camera.position.z = -271
        }
        // stop camera from going through left wall of Mint Room
        if (camera.position.x < -68) {
          camera.position.x = -68
        }
        // stop camera from going through right wall of Mint Room
        if (camera.position.x > 68) {
          camera.position.x = 68
        }
        // stop camera from going through back wall of Mint Room
        if (camera.position.z < -355) {
          camera.position.z = -355
        }
      } else {
        if (sphereOnPlatform == true) {
        } else {
          if (camera.position.z < -265) {
            camera.position.z = -265
          }
        }

        if (
          (camera.position.x >= 10 || camera.position.x <= -10) &&
          camera.position.z <= -265
        ) {
          camera.position.z = -265
          //camera.position.x = camera.position.x
        }
        /// stop Camera from going through the wall on the left side when camera greater than z = -248
        if (camera.position.x < -9 && camera.position.z > -248) {
          camera.position.x = -9
        }
        /// stop Camera from going through the wall on the right side when camera greater than z = -248
        if (camera.position.x > 9 && camera.position.z > -249) {
          camera.position.x = 9
        }
      }

      if (camera.position.z > 46) {
        camera.position.z = 46
      }
      if (camera.position.x < -218) {
        camera.position.x = -218
      }
      if (camera.position.x > 218) {
        camera.position.x = 218
      }

      // Stops the Sphere from going through walls
      if (
        (sphereBody.position.x >= 7 || sphereBody.position.x <= -7) &&
        sphereBody.position.z <= -265
      ) {
        sphereBody.position.z = -265
        //camera.position.x = camera.position.x
      }
      /// stop Camera from going through the wall on the left side when camera greater than z = -248
      if (sphereBody.position.x < -7 && sphereBody.position.z > -248) {
        sphereBody.position.x = -7
      }
      /// stop Camera from going through the wall on the right side when camera greater than z = -248
      if (sphereBody.position.x > 7 && sphereBody.position.z > -249) {
        sphereBody.position.x = 7
      }

      if (sphereBody.position.x < -7 && sphereBody.position.z >= -250) {
        sphereBody.position.z = -250
        //camera.position.x = camera.position.x
      }
      // stop the player from going through the wall on the right side when past z = -250
      if (sphereBody.position.x > 7 && sphereBody.position.z >= -250) {
        sphereBody.position.z = -250
        //camera.position.x = camera.position.x
      }
      if (sphereBody.position.z > 46) {
        sphereBody.position.z = 46
      }
      if (sphereBody.position.x < -217) {
        sphereBody.position.x = -217
      }
      if (sphereBody.position.x > 217) {
        sphereBody.position.x = 217
      }

      world.step(1 / 60, delta, 3)
      ThreeMeshUI.update()
      updateButtons()
      prevTime = time
      //controls.update()
      renderer.render(scene, camera)
    }

    animate()

    /*  setTimeout(() => {
      setOpen()
      keyCKeyDownHandler()
    }, 3000) */
  })

  ////////////////////// END OF LAYOUT EFFECTS///////////////////////////////

  const keyCKeyDownHandler = () => {
    if (keyCBool === false) {
      controls.unlock()
    } else {
      controls.lock()
    }
    keyCBool = !keyCBool
  }
  const onKeyDown = function (event) {
    /*  console.log(event.key)
    if (event.key === 'escape') {
      if (keyCBool === false) {
      } else {
        setOpen()
        keyCKeyDownHandler()
      }
    } */
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true
        break

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true
        break

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true
        break

      case 'ArrowRight':
      case 'KeyD':
        moveRight = true
        break
      case 'KeyC':
        setOpen()
        keyCKeyDownHandler()
        break
      /*  case 'KeyESC':
        if (keyCBool === false) {
        } else {
          setOpen()
          keyCKeyDownHandler()
        }
        break */
    }
  }

  const onKeyUp = function (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false
        break

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false
        break

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false
        break

      case 'ArrowRight':
      case 'KeyD':
        moveRight = false
        break
    }
  }

  /*   useEffect(() => {
    setTimeout(() => {
      try {
        setOpen()
        keyCKeyDownHandler()
      } catch (error) {}
    }, 3000)
  }, []) */

  function showID(id) {
    skullAry.forEach((skull, i) => {
      skull.visible = i === id ? true : false
    })
  }

  const nextHandler = () => {
    currentID = currentID === skullAry.length - 1 ? 0 : currentID + 1
    showID(currentID)
    console.log(currentID)
  }
  const previousHandler = () => {
    currentID -= 1
    if (currentID < 0) {
      currentID = 4
    }
    showID(currentID)
    console.log(currentID)
  }

  function VerticallyCenter({closeButtonHandler}) {
    const [open, setOpen] = useAtom(openAtom)
    const modeCloseButtonHander = () => {
      setOpen((prev) => !prev)
      closeButtonHandler()
    }

    return (
      <>
        <Modal isOpen={open} isCentered size="medium">
          <ModalOverlay />
          <ModalContent bg="rgba(0, 0, 0, 0.48)" width="800px">
            <ModalHeader
              bg="rgba(0, 0, 0, 0.48)"
              color="white"
              align="center"
              fontSize="4xl"
            >
              Mouse and Key Controls{' '}
            </ModalHeader>
            <Text
              bg="rgba(0, 0, 0, 0.48)"
              color="white"
              align="center"
              fontSize="2xl"
              fontWeight="bold"
              pb="5px"
            >
              Press C to Open and Close Panel
            </Text>
            <Flex justify="center" alignItems="center">
              {' '}
              <Icon
                as={FaMouse}
                fontSize="4xl"
                align="center"
                color="white"
                mr="5px"
              />{' '}
              <Text
                bg="rgba(0, 0, 0, 0.48)"
                align="center"
                color="white"
                fontWeight="bold"
                fontSize="lg"
                pb="10px"
              >
                Left click to lock cursor and right click or press{' '}
                <Kbd color="black">ESC</Kbd> to unlock cursor
              </Text>
            </Flex>

            <ModalCloseButton
              color="white"
              onClick={() => modeCloseButtonHander()}
            />
            <ModalBody bg="rgba(0, 0, 0, 0.48)">
              <Flex
                fontSize="4xl"
                justify="center"
                direction="column"
                alignItems="center"
              >
                <Icon
                  as={FaArrowUp}
                  fontSize="4xl"
                  align="center"
                  color="white"
                  mb="5px"
                />
                <Kbd mb="5px">W</Kbd>
              </Flex>
              <Flex fontSize="4xl" justify="center">
                <Icon as={FaArrowLeft} mr="5px" color="white" />
                <Kbd>A</Kbd>
                <Kbd ml="5px" mr="5px">
                  S
                </Kbd>
                <Kbd>D</Kbd>
                <Icon as={FaArrowRight} align="center" ml="5px" color="white" />
              </Flex>
              <Flex justify="center" fontSize="4xl" mt="5px">
                <Icon as={FaArrowDown} color="white" />
              </Flex>
            </ModalBody>
            <ModalFooter bg="rgba(0, 0, 0, 0.48)"></ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }

  console.log('inside App components')
  return (
    <>
      <canvas id="myCanvas" position="fixed" top="0" left="0"></canvas>
      <NavBar />
      <VerticallyCenter
        closeButtonHandler={keyCKeyDownHandler}
      ></VerticallyCenter>

      <Flex
        position="Fixed"
        left="50%"
        transform="translateX(-50%)"
        top="80px"
        direction="column"
        justify="center"
        alignItems="center"
        bg="rgba(90,234,152,.1)"
        border="1px"
        borderColor="#5aeb97"
      >
        {/*   <Box w="100%">
          {' '}
          <Heading p="10px" color="green">
            Poisin Skully 1/5
          </Heading>
          <Heading pb="2px" align="center" color="green">
            0.5 Avax
          </Heading>
        </Box> */}
      </Flex>
      {/*    <Flex
        position="Fixed"
        top="900px"
        left="50%"
        transform="translateX(-50%)"
        justify="center"
      >
        <Button
          size="lg"
          variant="solid"
          colorScheme="green"
          mr="20px"
          onClick={previousHandler}
        >
          Previouss
        </Button>
        <Button size="lg" variant="solid" colorScheme="green" mr="20px">
          Mint
        </Button>
        <Button
          size="lg"
          variant="solid"
          colorScheme="green"
          onClick={nextHandler}
        >
          Next
        </Button>
      </Flex> */}
    </>
  )
}

export default App
