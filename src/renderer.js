import * as posedetection from '@tensorflow-models/pose-detection';
import State from './state';
import Sound from './sound';
import Camera from './camera';
import view from './view';
import Game from './StayToEat';


export class RendererCanvas2d {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.videoWidth = canvas.width;
    this.videoHeight = canvas.height;
    this.lastPoseValidValue = false;
    this.modelType = posedetection.SupportedModels.BlazePose;
    this.scoreThreshold = 0.75;
    this.triggerAudio = false;
    this.headKeypoints = ['nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye', 'right_eye_outer', 'left_ear', 'right_ear'];
    this.headCircle = null;
    this.boxes = [];
    this.touchBox = null;
    this.headCircleXScale = 0.9;
    this.headCircleYScale = 1.4;
    this.showSkeleton = false;
    this.maxBoxes = 4;
    this.boxesProgress = [0, 0, 0, 0];
  }

  draw(rendererParams) {
    const [video, poses, isFPSMode, bodySegmentationCanvas, showMask = true] = rendererParams;
    this.updateCanvasDimensions(video);
    this.drawCtx(video, bodySegmentationCanvas);

    if (this.isStateActive()) {
      let isCurPoseValid = false;
      this.headCircle = null;
      const ratio = video.width / video.videoWidth;
      this.drawResults(poses, ratio, isFPSMode);
      isCurPoseValid = this.isPoseValid(poses);
      if (isCurPoseValid && State.bodyInsideRedBox.value) {
        this.handleStateTransitions();
      }
      this.drawHeadTracker(showMask);
      this.drawBox(isCurPoseValid, isFPSMode);
    }
  }

  updateCanvasDimensions(video) {
    this.videoWidth = video.width;
    this.videoHeight = video.height;
    this.ctx.canvas.width = this.videoWidth;
    this.ctx.canvas.height = this.videoHeight;
    //this.lineHeight = this.videoHeight / 2.5;
    this.redBoxX = this.videoWidth / 3;
    this.redBoxY = this.videoHeight / 5 * 1;
    this.redBoxWidth = this.videoWidth / 3;
    this.redBoxHeight = this.videoHeight / 5 * 4;
  }

  isStateActive() {
    return ['prepare', 'counting3', 'counting2', 'counting1', 'counting0', 'playing', 'outBox'].includes(State.state);
  }

  handleStateTransitions() {
    if (State.state === 'prepare' && State.getStateLastFor() > 3500) {
      State.changeState('counting3');
    } else if (State.state === 'counting3' && State.getStateLastFor() > 1000) {
      State.changeState('counting2');
    } else if (State.state === 'counting2' && State.getStateLastFor() > 1000) {
      State.changeState('counting1');
    } else if (State.state === 'counting1' && State.getStateLastFor() > 1000) {
      State.changeState('counting0');
    } else if (State.state === 'counting0' && State.getStateLastFor() > 1000) {
      State.changeState('playing', 'showStage');
    } else if (State.state === 'playing') {
      this.handlePlayingState();
    } else if (State.state === 'outBox' && State.bodyInsideRedBox.lastFor > 2000) {
      State.changeState('playing', 'waitAns');
    }
  }

  handlePlayingState() {
    if (State.stageType === 'showStage' && State.getStateLastFor() > 1000) {
      // Handle stage transition if necessary
    } else if (State.stateType === 'waitAns') {
      this.handleWaitAnsState();
    } else if (State.stateType === 'touched1' && State.selectedImg.lastFor > 2000) {
      State.changeState('playing', 'touched2');
    } else if (State.stateType === 'touched2' && State.selectedImg.lastFor > 3000) {
      // Handle answer checking if necessary
    } else if (!State.selectedImg.value) {
      //State.changeState('playing', 'waitAns');
    }
  }

  handleWaitAnsState() {
    if (State.selectedImg.value && State.selectedImg.lastFor > 1000) {
      // Handle answer checking if necessary
    }
  }

  checkCircleRectIntersection(
    circleX, circleY, circleRadius,
    rectLeft, rectTop, rectRight, rectBottom
  ) {
    // Calculate the distance between the circle center and the closest point on the rectangle
    let distanceX = Math.max(rectLeft - circleX, 0, circleX - rectRight);
    let distanceY = Math.max(rectTop - circleY, 0, circleY - rectBottom);

    // Check if the distance is less than the circle radius
    let distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared <= (circleRadius * circleRadius);
  }

  isPoseValid(poses) {
    let isBodyOutBox;
    let pose = poses[0];
    //logController.log("poses", pose);
    if (!pose || pose === undefined || !this.headCircle) {
      isBodyOutBox = true;
    }
    else {
      isBodyOutBox = false;
    }

    State.setPoseState('bodyInsideRedBox', !isBodyOutBox);
    if (isBodyOutBox) {
      if (State.state == 'playing') {
        if (State.lang === "1" && State.lang) {
          if (!State.isPlayingAudio) {
            State.changeState('outBox', 'outBox');
          }
        } else {
          State.changeState('outBox', 'outBox');
        }
      }
      if (this.ctx) {
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.videoWidth, this.videoHeight);
        this.ctx.strokeStyle = '#ff0000'; // Red color
        this.ctx.lineWidth = Math.max(10, this.videoHeight * 0.01); // Set the line width if needed
        this.ctx.stroke();
      }
      //logController.log('outBox', 'outBox');
      this.drawHeadTracker(false);
      return false;
    }
    return true;
  }
  updateProgressBar(id, progress, reset = false) {
    let progressLeft;
    const progressIndicator = document.getElementById(`progressId_${id}`);
    if (progressIndicator) {
      progressLeft = Math.min(progress, 100); // Ensure progress doesn't exceed 100%
      progressIndicator.style.transition = reset ? 'none' : 'left 0s linear';
      progressIndicator.style.left = `${progressLeft - 100}%`; // Move from -100% to 0%
    }
    this.updateOutline(id, progressLeft, reset);
  }
  updateOutline(id, progressLeft, resetOutline = false, hidden = false) {
    const outline = document.getElementById(`outlineId_${id}`);
    if (hidden) {
      outline.style.opacity = 0;
    }
    else {
      if (outline) {
        if (resetOutline) {
          // Remove outline class if it's a reset
          //outline.style.opacity = 1;
          if (outline.classList.contains('outline')) {
            outline.classList.remove('outline');
          }
        } else {
          // Add outline class based on current progress
          if (progressLeft > 0) {
            outline.classList.add('outline');
          } else {
            outline.classList.remove('outline');
          }
        }
      }
    }
  }

  drawBox(isCurPoseValid = true, isFPSMode = false) {
    if (Game.boxStatus === null || !isCurPoseValid) return;
    const screenWidth = this.videoWidth;
    const screenHeight = this.videoHeight;
    const boxHeight = screenHeight * 0.95;
    const outerSpace = screenWidth * 0.05;
    const middleSpace = screenWidth * 0.15;
    const totalBoxWidth = (screenWidth - (outerSpace * 2 + middleSpace)) / this.maxBoxes;

    // Create the boxes based on the status
    this.boxes = [
      { id: 0, x: 0, y: (screenHeight - boxHeight) / 2, width: totalBoxWidth, height: boxHeight, enable: Game.boxStatus[0], touched: false },
      { id: 1, x: totalBoxWidth + outerSpace, y: (screenHeight - boxHeight) / 2, width: totalBoxWidth, height: boxHeight, enable: Game.boxStatus[1], touched: false },
      { id: 2, x: totalBoxWidth * 2 + outerSpace + middleSpace, y: (screenHeight - boxHeight) / 2, width: totalBoxWidth, height: boxHeight, enable: Game.boxStatus[2], touched: false },
      { id: 3, x: totalBoxWidth * 3 + (outerSpace * 2) + middleSpace, y: (screenHeight - boxHeight) / 2, width: totalBoxWidth, height: boxHeight, enable: Game.boxStatus[3], touched: false }
    ];

    //this.updateProgressBar(0, 100);
    //this.updateProgressBar(1, 100);
    this.boxes.forEach(box => {
      if (box.enable) {
        if (this.headCircle &&
          State.state == 'playing' && ['waitAns'].includes(State.stateType)) {
          // Check if the head circle is within the box
          if ((this.headCircle.x) > (box.x) &&
            (this.headCircle.x) < (box.x + box.width) &&
            (this.headCircle.y) > (box.y) &&
            (this.headCircle.y) < (box.y + box.height)
          ) {
            State.setPoseState('selectedImg', box);
            this.boxesProgress[box.id] = Math.min(this.boxesProgress[box.id] + 1, 30);
            const progressPercentage = (this.boxesProgress[box.id] / 30) * 100;
            this.updateProgressBar(box.id, progressPercentage);
          }
          else {
            this.boxesProgress[box.id] = 0;
            this.updateProgressBar(box.id, 0, true);
          }

          if (this.boxesProgress[box.id] >= 30) {
            box.touched = true;
            this.updateOutline(box.id, null, false, true);
            Game.fillWord(box.id);
          }
          // Drawing the box with the progress visualized
          if (isFPSMode || this.showSkeleton) {
            this.ctx.beginPath();
            this.ctx.setLineDash([5, 5]); // Dashed line style
            this.ctx.rect(box.x, box.y, box.width, box.height);
            this.ctx.strokeStyle = box.touched ? 'green' : '#000000'; // Outline color
            this.ctx.stroke();
          }
        }
        else {
          // Reset progress and update progress bar to 0 if not in the specified state
          this.boxesProgress[box.id] = 0;
          this.updateProgressBar(box.id, 0, true);
        }
      }
    });

    Game.boxesArea = this.boxes;
  }

  drawHeadTracker(status = true) {
    if (this.headCircle) {
      if (status) {
        const widthScale = State.lang === "0" ? 50 : 50;
        const xInVw = (this.headCircle.x / window.innerWidth) * 100;
        const maxWidth = this.headCircle.radius * 2 / window.innerWidth * widthScale;
        const width = `${maxWidth}vw`;
        const left = `calc(${xInVw}vw - ${maxWidth / 2}vw)`;
        const offsetY = Math.max(10, maxWidth / 0.4);
        const top = `calc(${this.headCircle.y - offsetY}px)`;
        const rotationScaleFactor = 1.5;
        const rotation = this.headCircle.rotation * rotationScaleFactor;
        view.showHeadTracker(true, width, left, top, rotation);
      }
      else {
        view.showHeadTracker(false);
      }
    }
  }

  drawCtx(video, bodySegmentationCanvas) {
    if (Camera.constraints.video.facingMode == 'user') {
      this.ctx.translate(this.videoWidth, 0);
      this.ctx.scale(-1, 1);
    }
    this.ctx.drawImage(bodySegmentationCanvas ? bodySegmentationCanvas : video, 0, 0, this.videoWidth, this.videoHeight);
    if (Camera.constraints.video.facingMode == 'user') {
      this.ctx.translate(this.videoWidth, 0);
      this.ctx.scale(-1, 1);
    }
  }

  enhanceSharpness() {
    const imageData = this.ctx.getImageData(0, 0, this.videoWidth, this.videoHeight);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const outputData = this.ctx.createImageData(width, height);
    const output = outputData.data;

    // 锐化卷积核
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;

        // 应用卷积核
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIdx = ((y + ky) * width + (x + kx)) * 4;
            r += data[pixelIdx] * kernel[ky + 1][kx + 1];
            g += data[pixelIdx + 1] * kernel[ky + 1][kx + 1];
            b += data[pixelIdx + 2] * kernel[ky + 1][kx + 1];
          }
        }
        // 限制 RGB 值在 0-255 之间
        output[idx] = Math.min(Math.max(r, 0), 255);     // R
        output[idx + 1] = Math.min(Math.max(g, 0), 255); // G
        output[idx + 2] = Math.min(Math.max(b, 0), 255); // B
        output[idx + 3] = 255; // Alpha
      }
    }
    // 将处理后的数据绘制回 Canvas
    this.ctx.putImageData(outputData, 0, 0);
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight);
  }

  drawResults(poses, ratio, isFPSMode) {
    for (const pose of poses) {
      this.drawResult(pose, ratio, isFPSMode);
    }
  }

  drawResult(pose, ratio, isFPSMode) {
    if (pose.keypoints != null) {
      this.keypointsFitRatio(pose.keypoints, ratio);
      if (isFPSMode || this.showSkeleton) this.drawKeypoints(pose.keypoints);
      this.drawSkeleton(pose.keypoints, pose.id, isFPSMode);
    }
  }

  drawKeypoints(keypoints) {
    const keypointInd = posedetection.util.getKeypointIndexBySide(this.modelType);
    this.ctx.fillStyle = 'Red';
    this.ctx.strokeStyle = 'White';
    this.ctx.lineWidth = 2;

    for (const i of keypointInd.middle) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = 'Green';
    for (const i of keypointInd.left) {
      this.drawKeypoint(keypoints[i]);
    }

    this.ctx.fillStyle = 'Orange';
    for (const i of keypointInd.right) {
      this.drawKeypoint(keypoints[i]);
    }
  }

  keypointsFitRatio(keypoints, ratio) {
    for (let keypoint of keypoints) {
      keypoint.x = (Camera.constraints.video.facingMode == 'user') ? this.videoWidth - (keypoint.x * ratio) : (keypoint.x * ratio);
      keypoint.y = keypoint.y * ratio;
    }
  }

  drawKeypoint(keypoint) {
    // If score is null, just show the keypoint.
    const score = keypoint.score != null ? keypoint.score : 1;
    //const scoreThreshold = params.STATE.modelConfig.scoreThreshold || 0;

    if (score >= this.scoreThreshold && this.headKeypoints.includes(keypoint.name)) {
      const circle = new Path2D();
      circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      this.ctx.fill(circle);
      this.ctx.stroke(circle);
    }
  }

  drawSkeleton(keypoints, poseId, isFPSMode) {
    const color = 'White';
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;

    let leftEar = null;
    let rightEar = null;
    let offsetY = null;
    let circleY = null;

    posedetection.util.getAdjacentPairs(this.modelType).forEach(([i, j]) => {

      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;

      if (this.headKeypoints.includes(kp1.name) && this.headKeypoints.includes(kp2.name) &&
        score1 >= this.scoreThreshold && score2 >= this.scoreThreshold) {

        this.ctx.beginPath();
        this.ctx.moveTo(kp1.x, kp1.y);
        this.ctx.lineTo(kp2.x, kp2.y);
        if (isFPSMode || this.showSkeleton) this.ctx.stroke();
      }

      // Store keypoints for left and right eye outer
      if (kp1.name === 'left_ear') leftEar = kp1;
      if (kp1.name === 'right_ear') rightEar = kp1;

      if (kp2.name === 'left_ear') leftEar = kp2;
      if (kp2.name === 'right_ear') rightEar = kp2;
    });

    // Draw circle around the head
    if (leftEar && rightEar) {
      const dx = Math.abs(rightEar.x - leftEar.x);
      const dy = Math.abs(rightEar.y - leftEar.y);
      const averageDistance = (dx + dy) / 2;
      const centerX = (leftEar.x + rightEar.x) / 2;
      const centerY = (leftEar.y + rightEar.y) / 2;
      offsetY = (centerY * 0.02);
      circleY = centerY - offsetY;
      //let distanceLeftMid = Math.abs(circleY - leftEar.y);
      //let distanceRightMid = Math.abs(circleY - rightEar.y);

      //const distance = Math.abs(circleY - nose.y);
      // Increase the radius to better cover the head
      const scaleFactor = 1.3; // Adjust this factor as needed
      const adjustedRadius = averageDistance * scaleFactor;
      const edx = rightEar.x - leftEar.x;
      const edy = rightEar.y - leftEar.y;
      const rotation = Math.atan2(edy, edx) * (180 / Math.PI);
      this.headCircle = {
        x: centerX,
        y: circleY,
        rotation: rotation,
        radius: adjustedRadius,
      };

      if (isFPSMode || this.showSkeleton) {
        /*const radiusX = adjustedRadius * this.headCircleXScale;
        const radiusY = adjustedRadius * this.headCircleYScale;
        this.ctx.beginPath();
        this.ctx.ellipse(this.headCircle.x, this.headCircle.y, radiusX, radiusY, 0, 0, 2 * Math.PI);
        this.ctx.stroke();*/

        // Draw the keypoint as a larger circle
        this.ctx.fillStyle = 'Green';
        this.ctx.strokeStyle = 'White';
        this.ctx.lineWidth = 2;
        const circle = new Path2D();
        const largerRadius = 30; // Change this value to your desired size
        circle.arc(this.headCircle.x, this.headCircle.y, largerRadius, 0, 2 * Math.PI);
        this.ctx.fill(circle);
        this.ctx.stroke(circle);
      }
    }
  }


}
