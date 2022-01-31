import './App.css'
import * as THREE from 'three'
import {useEffect, useLayoutEffect} from 'react'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {BoxLineGeometry} from 'three/examples/jsm/geometries/BoxLineGeometry.js'
import ThreeMeshUI from 'three-mesh-ui'
import GLB from './rainbo.glb'
import GLB2 from './rainbo111.glb'
import GLB3 from './skellyGreen.glb'
import GLB4 from './skellyHottest.glb'
import GLB5 from './skelly.glb'
import {Text, Button, Flex, Box, Heading} from '@chakra-ui/react'
import FontJSON from './assets/Roboto-msdf.json'
import FontImage from './assets/Roboto-msdf.png'
import {useMoralis, useERC20Balances, useNFTBalances} from 'react-moralis'
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
let skullAry = []

const loader = new GLTFLoader()

loader.load(
  GLB,
  function (gltf) {
    skull = gltf.scene
    skull.scale.set(1, 1, 1)
    skull.position.set(0, -1.2, 0)
    skull.rotation.y = 1.5708
    skullAry.push(skull)
    scene.add(skull)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  GLB2,
  function (gltf) {
    skull2 = gltf.scene
    skull2.visible = false
    skull2.scale.set(1, 1, 1)
    skull2.position.set(0, -1.2, 0)
    skull2.rotation.y = 1.5708
    skullAry.push(skull2)
    scene.add(skull2)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  GLB3,
  function (gltf) {
    skull3 = gltf.scene
    skull3.visible = false
    skull3.scale.set(1, 1, 1)
    skull3.position.set(0, -1.2, 0)
    skull3.rotation.y = 1.5708
    skullAry.push(skull3)
    scene.add(skull3)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  GLB4,
  function (gltf) {
    skull4 = gltf.scene
    skull4.visible = false
    skull4.scale.set(1, 1, 1)
    skull4.position.set(0, -1.2, 0)
    skull4.rotation.y = 1.5708
    skullAry.push(skull4)
    scene.add(skull4)
  },
  undefined,
  function (error) {
    console.error(error)
  },
)

loader.load(
  GLB5,
  function (gltf) {
    skull5 = gltf.scene
    skull5.visible = false
    skull5.scale.set(1, 1, 1)
    skull5.position.set(0, -1.2, 0)
    skull5.rotation.y = 1.5708
    skullAry.push(skull5)
    scene.add(skull5)
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
    camera.position.setZ(-35)

    renderer.render(scene, camera)

    const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6347,
      wireframe: true,
    })
    const torus = new THREE.Mesh(geometry, material)
    //scene.add(torus)

    const pointLight = new THREE.PointLight(0xb85b14)
    const pointLight2 = new THREE.PointLight(0xb85b14)
    pointLight.position.set(-5, 5, 10)
    pointLight2.position.set(30, 5, -50)
    const ambientLight = new THREE.AmbientLight(0xb85b14)
    scene.add(ambientLight)
    scene.add(pointLight)
    scene.add(pointLight2)
    const room = new THREE.LineSegments(
      new BoxLineGeometry(6, 4, 80, 10, 10, 10).translate(0, 1, 1.5),
      new THREE.LineBasicMaterial({color: 0x808080}),
    )

    const roomMesh = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 6, 10, 10, 10).translate(0, 1, 1.5),
      new THREE.MeshBasicMaterial({side: THREE.BackSide}),
    )

    //scene.add(room)

    //const gridHelper = new THREE.GridHelper(200, 50)
    const lightHelper = new THREE.PointLightHelper(pointLight)
    //scene.add(lightHelper)
    const lightHelper2 = new THREE.PointLightHelper(pointLight2)
    //scene.add(lightHelper2)
    const controls = new OrbitControls(camera, renderer.domElement)

    function animate() {
      requestAnimationFrame(animate)

      try {
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
      }

      controls.update()
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
        <Box w="100%">
          {' '}
          <Heading p="10px" color="green">
            Poisin Skully 1/5
          </Heading>
          <Heading pb="2px" align="center" color="green">
            0.5 Avax
          </Heading>
        </Box>
      </Flex>
      <Flex
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
      </Flex>
    </>
  )
}

export default App
