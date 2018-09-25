import React from 'react';
import { AR, Permissions } from 'expo';
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
import { View as GraphicsView } from 'expo-graphics';

export default class App extends React.Component {
  state = { permission: false };

  componentDidMount() {
    THREE.suppressExpoWarnings();
    ThreeAR.suppressWarnings();

    this.getPermission();
  }

  getPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      permission: status === 'granted'
    });
  };

  render() {
    if (!this.state.permission) {
      return null;
    }

    return (
      <GraphicsView
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreate}
        onRender={this.onRender}
        onResize={this.onResize}
        isShadowsEnabled
        isArEnabled
        isArRunningStateEnabled
        isArCameraStateEnabled
        arTrackingConfiguration={AR.TrackingConfigurations.World}
      />
    );
  }

  onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);

    this.renderer = new ExpoTHREE.Renderer({
      gl,
      pixelRatio,
      width,
      height
    });

    this.renderer.gammaInput = this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);

    this.magneticObject = new ThreeAR.MagneticObject();
    this.scene.add(this.magneticObject);

    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshPhongMaterial({ color: 0x096fec });

    this.cube = new THREE.Mesh(geometry, material);

    this.cube.castShadow = true;
    this.cube.position.y = 0.05;
    this.magneticObject.add(this.cube);

    this.shadowFloor = new ThreeAR.ShadowFloor({
      width: 1,
      height: 1,
      opacity: 0.6
    });

    this.magneticObject.add(this.shadowFloor);

    this.scene.add(new THREE.AmbientLight(0x404040));

    this.shadowLight = this.getShadowLight();
    this.scene.add(this.shadowLight);
    this.scene.add(this.shadowLight.target);
  };

  getShadowLight = () => {
    let light = new THREE.DirectionalLight(0xffffff, 0.6);

    light.castShadow = true;

    const shadowSize = 0;
    light.shadow.camera.left = -shadowSize;
    light.shadow.camera.right = shadowSize;
    light.shadow.camera.top = shadowSize;
    light.shadow.camera.bottom = -shadowSize;
    light.shadow.camera.near = 0.001;
    light.shadow.camera.far = 100;
    light.shadow.camera.updateProjectionMatrix();

    light.shadow.mapSize.width = 512 * 2;
    light.shadow.mapSize.height = light.shadow.mapSize.width;

    return light;
  };

  screenCenter = new THREE.Vector2(0.5, 0.5);

  onResize = ({ x, y, scale, width, height }) => {
    if (!this.renderer) {
      return;
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = () => {
    this.magneticObject.update(this.camera, this.screenCenter);

    this.shadowLight.target.position.copy(this.magneticObject.position);
    this.shadowLight.position.copy(this.shadowLight.target.position);
    this.shadowLight.position.x += 0.1;
    this.shadowLight.position.y += 1;
    this.shadowLight.position.z += 0.1;

    this.renderer.render(this.scene, this.camera);
  };
}
