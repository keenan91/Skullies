import './App.css'
import * as THREE from 'three'
import {useEffect, useLayoutEffect} from 'react'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {BoxLineGeometry} from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import ThreeMeshUI from 'three-mesh-ui'

import GLB from './claySkelly2.glb'
import {Text, Button, Flex, Box, Heading} from '@chakra-ui/react'
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
let skullAry = []
let claySkelly
let wallZ = 45
let leftCorridorX = -32.5
let rightCorridorX = 32.5
const gui = new dat.GUI({width: 800})
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
gui.add(wallMaterial, 'metalness').min(0).max(1).step(0.01)
gui.add(wallMaterial, 'roughness').min(0).max(1).step(0.01)
gui.add(wallMaterial, 'displacementScale').min(0).max(100).step(0.01)
gui.add(wallMaterial, 'aoMapIntensity').min(0).max(100).step(0.01)

// Loading in the GLTF Files
loader.load(
  GLB,
  function (gltf) {
    claySkelly = gltf.scene
    claySkelly.scale.set(1, 1, 1)
    claySkelly.position.set(0, -5, 0)
    //claySkelly.rotation.y = 1.5708
    //torch.push(skull5)
    scene.add(claySkelly)
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
      bg="rgba(93,234,90,.1)"
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
  let moveForward = false
  let moveBackward = false
  let moveLeft = false
  let moveRight = false
  let canJump = false

  let prevTime = performance.now()
  const velocity = new THREE.Vector3()
  const direction = new THREE.Vector3()
  const vertex = new THREE.Vector3()

  useLayoutEffect(() => {
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
    camera.position.setZ(-230)

    renderer.render(scene, camera)

    const geometry = new THREE.PlaneGeometry(45, 20)

    let createWalls = () => {
      const firstBackWall = new THREE.Mesh(geometry, wallMaterial)
      //firstBackWall.rotation.y = Math.PI / 2
      //firstBackWall.rotation.z = Math.PI / 2
      firstBackWall.position.set(0, 0, 50)
      scene.add(firstBackWall)

      const lastCeilingInFirstCorridor = new THREE.Mesh(geometry, wallMaterial)
      lastCeilingInFirstCorridor.position.set(0, 10, -270)
      lastCeilingInFirstCorridor.rotation.y = Math.PI
      lastCeilingInFirstCorridor.rotation.z = Math.PI / 2
      lastCeilingInFirstCorridor.rotation.x = Math.PI / 2
      scene.add(lastCeilingInFirstCorridor)
      // wall bottom
      const lastFloorInFirstCorridor = new THREE.Mesh(geometry, groundMaterial)
      lastFloorInFirstCorridor.position.set(0, -10, -270)
      lastFloorInFirstCorridor.rotation.y = Math.PI
      lastFloorInFirstCorridor.rotation.z = Math.PI / 2
      lastFloorInFirstCorridor.rotation.x = Math.PI / 2
      scene.add(lastFloorInFirstCorridor)

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
        const floorWall = new THREE.Mesh(geometry, groundMaterial)
        floorWall.position.set(0, -10, wallZ)
        floorWall.rotation.y = Math.PI
        floorWall.rotation.z = Math.PI / 2
        floorWall.rotation.x = Math.PI / 2
        scene.add(floorWall)

        wallZ = wallZ - 45
        console.log(wallZ)
      }

      for (let i = 0; i < 5; i++) {
        // Left corridor Planes
        const leftCorridorRightWall = new THREE.Mesh(geometry, wallMaterial)
        leftCorridorRightWall.position.set(leftCorridorX, 0, -247.5)
        scene.add(leftCorridorRightWall)
        const leftCorridorLeftWall = new THREE.Mesh(geometry, wallMaterial)
        leftCorridorLeftWall.position.set(leftCorridorX, 0, -267.5)
        scene.add(leftCorridorLeftWall)
        const leftCorridorFloorWall = new THREE.Mesh(geometry, groundMaterial)
        leftCorridorFloorWall.position.set(leftCorridorX, -10, -257.5)
        leftCorridorFloorWall.rotation.y = Math.PI
        leftCorridorFloorWall.rotation.z = Math.PI
        leftCorridorFloorWall.rotation.x = Math.PI / 2
        scene.add(leftCorridorFloorWall)
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
        const rightCorridorFloorWall = new THREE.Mesh(geometry, groundMaterial)
        rightCorridorFloorWall.position.set(rightCorridorX, -10, -257.5)
        rightCorridorFloorWall.rotation.y = Math.PI
        rightCorridorFloorWall.rotation.z = Math.PI
        rightCorridorFloorWall.rotation.x = Math.PI / 2
        scene.add(rightCorridorFloorWall)
        const rightCorridorCielingWall = new THREE.Mesh(geometry, wallMaterial)
        rightCorridorCielingWall.position.set(rightCorridorX, 10, -257.5)
        rightCorridorCielingWall.rotation.y = Math.PI
        rightCorridorCielingWall.rotation.z = Math.PI
        rightCorridorCielingWall.rotation.x = Math.PI / 2
        scene.add(rightCorridorCielingWall)

        leftCorridorX = leftCorridorX - 45
        rightCorridorX = rightCorridorX + 45
      }
    }
    createWalls()

    /* 
    const plane2Seg3 = new THREE.Mesh(geometry, wallMaterial)
    //plane2Seg3.rotation.y = Math.PI / 2
    //plane2Seg3.rotation.z = Math.PI / 2
    plane2Seg3.position.set(0, 0, -37)
    scene.add(plane2Seg3) */

    const pointLight = new THREE.PointLight(0xb85b14, 0.75, 62, 1.5)
    const pointLight2 = new THREE.PointLight(0xb85b14, 0.75, 62, 1.5)
    pointLight.position.set(10, 3, 15)
    pointLight2.position.set(-10, 3, 5)
    gui.add(pointLight2, 'intensity').min(0).max(10).step(0.01)
    gui.add(pointLight2, 'distance').min(0).max(100).step(0.01)
    gui.add(pointLight2, 'decay').min(0).max(10).step(0.01)
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
    const planeShape = new CANNON.Plane(4, 2)
    const sphereShape = new CANNON.Sphere(5)
    const wallBody = new CANNON.Body({
      mass: 100,
      position: new CANNON.Vec3(4, 0, 0),
      shape: planeShape,
    })
    world.addBody(wallBody)
    const wallBody2 = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(-4, 0, 0),
      shape: planeShape,
    })
    world.addBody(wallBody2)

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
    const controls = new PointerLockControls(camera, document.body)

    const onKeyDown = function (event) {
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

        case 'Space':
          if (canJump === true) velocity.y += 350
          canJump = false
          break
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
    document.addEventListener('click', function () {
      controls.lock()
    })

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    controls.addEventListener('lock', function () {})
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
      /*  try {
        torch.position.x = camera.position.x
        torch.position.y = camera.position.y - 2
        torch.position.z = camera.position.z - 5
        torch.rotation.x = camera.rotation.x
        torch.rotation.y = camera.rotation.y
        torch.rotation.z = camera.rotation.z
      } catch (error) {}
 */
      //console.log(camera.position.z)
      if (camera.position.x < -10 && camera.position.z >= -250) {
        camera.position.z = -250
        //camera.position.x = camera.position.x
      }
      if (camera.position.x > 10 && camera.position.z >= -250) {
        camera.position.z = -250
        //camera.position.x = camera.position.x
      }

      if (camera.position.z <= -265) {
        camera.position.z = -265
        //camera.position.x = camera.position.x
      }

      if (camera.position.x < -9 && camera.position.z > -248) {
        camera.position.x = -9
      }
      if (camera.position.x > 9 && camera.position.z > -249) {
        camera.position.x = 9
      }
      if (camera.position.z > 46) {
        camera.position.z = 46
      }

      /*  if (camera.position.z < -36) {
        camera.position.z = -36
      } */

      //world.step(1 / 60, delta, 3)
      //console.log(camera.position.z)
      //wallBody.quaternion.copy(camera.quaternion.x,)
      //wallBody2.quaternion.copy(camera.quaternion)
      //console.log(wallBody2.quaternion)
      //console.log(camera.rotation)
      //wallBody.quaternion.copy(camera.rotation)
      // wallBody.quaternion.set(
      //   camera.quaternion._x,
      //   camera.quaternion._y,
      //   camera.quaternion._z,
      //   camera.quaternion._w,
      // )

      //console.log(wallBody.quaternion)
      //console.log(camera.quaternion)
      //wallBody.position.x += -velocity.x * delta
      //wallBody.position.z -= -velocity.z * delta
      //plane.position.copy(wallBody2.position)
      // camera.position.x = wallBody.position.x
      //camera.position.z = wallBody.position.z
      //plane3.position.copy(wallBody.position)

      //controls.getObject().position.y += velocity.y * delta // new behavior

      prevTime = time

      /* try {
        if (skull.rotation.y >= 4) {
          //console.log('skull.position.y', skull.rotation.y)
          rotationSign = -0.005
        }
        if (skull.rotation.y < 2) {
          rotationSign = 0.005
        }
        skull.rotation.y = skull.rotation.y + rotationSign
        skull2.rotation.y += rotationSign
        skull3.rotation.y += rotationSign
        skull4.rotation.y += rotationSign
        skull5.rotation.y += rotationSign
      } catch (error) {}
      if (camera.position.z < -3) {
        camera.position.z += 0.3
      } */

      //controls.update()
      renderer.render(scene, camera)
    }

    animate()
  })
  useEffect(() => {}, [])

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

  return (
    <>
      <canvas id="myCanvas" position="fixed" top="0" left="0"></canvas>
      <NavBar />
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
