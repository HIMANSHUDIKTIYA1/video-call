"use client";
import React, { useEffect, useRef, useState } from 'react';

function Second({ userInfo }) {
  const APP_ID = "612a2339e6394e0fb89fff05d6a02772";
  const token = null;
  const uid = String(Math.floor(Math.random() * 10000));
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  let localStream;
  let remoteStream;
  let peerConnection;
  let client;
  let channel;
  const roomId = userInfo.room; // This should be userInfo.room

  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
      }
    ]
  };

  const constraints = {
    video: {
      width: { min: 640, ideal: 1920, max: 1920 },
      height: { min: 480, ideal: 1080, max: 1080 },
      facingMode: 'user'
    },
    audio: true
  };

  useEffect(() => {
    const init = async () => {
      client = await AgoraRTM.createInstance(APP_ID);
      await client.login({ uid, token });

      channel = client.createChannel(roomId);
      await channel.join();

      channel.on('MemberJoined', handleUserJoined);
      channel.on('MemberLeft', handleUserLeft);

      client.on('MessageFromPeer', handleMessageFromPeer);

      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localVideoRef.current.srcObject = localStream;
    };

    const handleUserLeft = (MemberId) => {
      remoteVideoRef.current.style.display = 'none';
      localVideoRef.current.classList.remove('smallFrame');
    };

    const handleMessageFromPeer = async (message, MemberId) => {
      const parsedMessage = JSON.parse(message.text);

      if (parsedMessage.type === 'offer') {
        createAnswer(MemberId, parsedMessage.offer);
      }

      if (parsedMessage.type === 'answer') {
        addAnswer(parsedMessage.answer);
      }

      if (parsedMessage.type === 'candidate') {
        if (peerConnection) {
          await peerConnection.addIceCandidate(parsedMessage.candidate);
        }
      }
    };

    const handleUserJoined = async (MemberId) => {
      console.log('A new user joined the channel:', MemberId);
      createOffer(MemberId);
    };

    const createPeerConnection = async (MemberId) => {
      peerConnection = new RTCPeerConnection(servers);

      remoteStream = new MediaStream();
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.style.display = 'block';

      localVideoRef.current.classList.add('smallFrame');

      if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream;
      }

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          await client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId);
        }
      };
    };

    const createOffer = async (MemberId) => {
      await createPeerConnection(MemberId);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      await client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, MemberId);
    };

    const createAnswer = async (MemberId, offer) => {
      await createPeerConnection(MemberId);

      await peerConnection.setRemoteDescription(offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      await client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, MemberId);
    };

    const addAnswer = async (answer) => {
      if (!peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(answer);
      }
    };

    const leaveChannel = async () => {
      await channel.leave();
      await client.logout();
    };

    const toggleCamera = async () => {
      const videoTrack = localStream.getTracks().find(track => track.kind === 'video');

      if (videoTrack.enabled) {
        videoTrack.enabled = false;
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80)';
      } else {
        videoTrack.enabled = true;
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(148, 149, 149, 0.9)';
      }
    };

    const switchCamera = async () => {
      localStream.getTracks().forEach(track => track.stop());
      const newFacingMode = isFrontCamera ? 'environment' : 'user';
      setIsFrontCamera(!isFrontCamera);

      localStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true
      });

      localVideoRef.current.srcObject = localStream;
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    };

    const toggleScreenShare = async () => {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStream.getTracks().forEach(track => track.stop());
        localStream = screenStream;
        localVideoRef.current.srcObject = screenStream;

        screenStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, screenStream);
          track.onended = () => stopScreenShare();
        });

        setIsScreenSharing(true);
        document.getElementById('screen-s').style.backgroundColor = 'rgb(255, 80, 80)';
      } else {
        stopScreenShare();
      }
    };

    const stopScreenShare = async () => {
      setIsScreenSharing(false);
      document.getElementById('screen-s').style.backgroundColor = 'rgb(148, 149, 149, 0.9)';
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;

      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    };

    const toggleMic = async () => {
      const audioTrack = localStream.getTracks().find(track => track.kind === 'audio');

      if (audioTrack.enabled) {
        audioTrack.enabled = false;
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80)';
      } else {
        audioTrack.enabled = true;
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(148, 149, 149, 0.9)';
      }
    };

    init();

    document.getElementById('camera-btn').addEventListener('click', toggleCamera);
    document.getElementById('mic-btn').addEventListener('click', toggleMic);
    document.getElementById('switch').addEventListener('click', switchCamera);
    document.getElementById('screen-s').addEventListener('click', toggleScreenShare);
    document.getElementById('leave-btn').addEventListener('click', leaveChannel);

    return () => {
      document.getElementById('camera-btn').removeEventListener('click', toggleCamera);
      document.getElementById('mic-btn').removeEventListener('click', toggleMic);
      document.getElementById('switch').removeEventListener('click', switchCamera);
      document.getElementById('screen-s').removeEventListener('click', toggleScreenShare);
      document.getElementById('leave-btn').removeEventListener('click', leaveChannel);
    };
  }, [isFrontCamera, isScreenSharing]);

  return (
    <div>
      <div id="videos">
        <video className="video-player" id="user-1" ref={localVideoRef} autoPlay playsInline></video>
        <video className="video-player" id="user-2" ref={remoteVideoRef} autoPlay playsInline></video>
      </div>
      <div id="controls">
        <div className="control-container" id="camera-btn">
          <img src="./camera.png" alt="Camera" />
        </div>
        <div className="control-container" id="mic-btn">
          <img src="./mic.png" alt="Microphone" />
        </div>
        <div className="control-container" id="switch">
          <img src="./switch-camera.png" alt="Switch Camera" />
        </div>
        <div className="control-container" id="screen-s">

          <img src="./share.png" alt="screen-s" />
        </div>
        <div className="control-container" id="leave-btn">
          <img src="./phone.png" alt="Leave Call" />
        </div>
      </div>
    </div>
  );
}

export default Second;
