"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[290],{5823:(e,n,i)=>{i.r(n),i.d(n,{data:()=>d});const d=JSON.parse('{"key":"v-06bb4a38","path":"/pages/webrtc/WebRTC%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90(%E5%9B%9B)%20Android%E3%80%81IOS%E3%80%81Windows%20%E8%A7%86%E9%A2%91%E6%95%B0%E6%8D%AE%E6%B5%81%E7%A8%8B%E5%88%86%E6%9E%90.html","title":"","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"1. 简介","slug":"_1-简介","link":"#_1-简介","children":[]},{"level":2,"title":"2. 发送","slug":"_2-发送","link":"#_2-发送","children":[{"level":3,"title":"2.1 采集","slug":"_2-1-采集","link":"#_2-1-采集","children":[]},{"level":3,"title":"2.2 编码","slug":"_2-2-编码","link":"#_2-2-编码","children":[]},{"level":3,"title":"2.3 编码结束 -> RTP 打包","slug":"_2-3-编码结束-rtp-打包","link":"#_2-3-编码结束-rtp-打包","children":[]},{"level":3,"title":"2.4 打包完成 -> PacedSender 队列","slug":"_2-4-打包完成-pacedsender-队列","link":"#_2-4-打包完成-pacedsender-队列","children":[]},{"level":3,"title":"2.5 Socket#send","slug":"_2-5-socket-send","link":"#_2-5-socket-send","children":[]}]},{"level":2,"title":"3. 接收","slug":"_3-接收","link":"#_3-接收","children":[{"level":3,"title":"3.1 接收 RTP 包","slug":"_3-1-接收-rtp-包","link":"#_3-1-接收-rtp-包","children":[]},{"level":3,"title":"3.2 解包 & 放入缓冲区","slug":"_3-2-解包-放入缓冲区","link":"#_3-2-解包-放入缓冲区","children":[]},{"level":3,"title":"3.3 解码","slug":"_3-3-解码","link":"#_3-3-解码","children":[]},{"level":3,"title":"3.4 视频渲染","slug":"_3-4-视频渲染","link":"#_3-4-视频渲染","children":[]}]},{"level":2,"title":"总结","slug":"总结","link":"#总结","children":[]},{"level":2,"title":"参考","slug":"参考","link":"#参考","children":[]}],"git":{"updatedTime":1693297754000,"contributors":[{"name":"make","email":"yang1001yk@gmail.com","commits":1}]},"filePathRelative":"pages/webrtc/WebRTC源码分析(四) Android、IOS、Windows 视频数据流程分析.md"}')},9236:(e,n,i)=>{i.r(n),i.d(n,{default:()=>t});var d=i(6252);const r=(0,d.uE)('<h2 id="_1-简介" tabindex="-1"><a class="header-anchor" href="#_1-简介" aria-hidden="true">#</a> 1. 简介</h2><p>该篇文章主要针对在 (IOS、Android、Windows)平台上的视频数据的流程，只有当我们熟悉了这些流程后，才能快速针对性的去看某块代码。下面是一个简要的流程图，我们根据这个流程图然后来分析。</p><p><img src="http://devyk.top/2022/202308281502315.png" alt="WebRTC 简要数据流程图 (1)"></p><p><strong>环境:</strong></p><ul><li>webrtc: m98</li><li>Android / IOS 编解码：MediaCodec / VideoToolBox</li><li>Windows 编解码：OpenH264 / FFmpeg H264</li><li>Android / IOS / Windows 渲染：OpenGL ES / Metal / StretchDIBits</li></ul><p>引用李超老师的一张数据流程图:</p><p><img src="http://devyk.top/2022/202306111502251.png" alt="image-20221119233539085"></p><p><strong>建议阅读顺序:</strong></p><p>第一种方式:</p><ul><li>IOS 阅读的话，可以参考 #? 序号，其它平台参考 IOS 阅读的顺序即可</li></ul><p>第二种方式:</p><ul><li><p>平台采集 -&gt; 公共编码 -&gt; 平台编码 -&gt; 公共编码 -&gt; 封包 -&gt; 发送-&gt;接收 -&gt; 解包 -&gt; 公共解码 -&gt; 平台解码</p><p>-&gt; 公共解码 -&gt; 平台渲染</p></li></ul><h2 id="_2-发送" tabindex="-1"><a class="header-anchor" href="#_2-发送" aria-hidden="true">#</a> 2. 发送</h2><h3 id="_2-1-采集" tabindex="-1"><a class="header-anchor" href="#_2-1-采集" aria-hidden="true">#</a> 2.1 采集</h3><h4 id="_2-1-1-ios" tabindex="-1"><a class="header-anchor" href="#_2-1-1-ios" aria-hidden="true">#</a> 2.1.1 IOS</h4><div class="language-tex line-numbers-mode" data-ext="tex"><pre class="language-tex"><code>#8\twebrtc::ObjCVideoTrackSource::OnCapturedFrame(RTCVideoFrame*) at webrtc/sdk/objc/native/src/objc_video_track_source.mm:124\n#7\t<span class="token punctuation">[</span>RTCVideoSource capturer:didCaptureVideoFrame:<span class="token punctuation">]</span> at webrtc/sdk/objc/api/peerconnection/RTCVideoSource.mm:79\n#6\t<span class="token punctuation">[</span>RTCCameraVideoCapturer captureOutput:didOutputSampleBuffer:fromConnection:<span class="token punctuation">]</span> at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:299\n#5\t<span class="token punctuation">[</span>videoDataOutput setSampleBufferDelegate:self queue:self.frameQueue<span class="token punctuation">]</span>;\n#4\t<span class="token punctuation">[</span>RTCCameraVideoCapturer setupVideoDataOutput<span class="token punctuation">]</span> at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:455\n#3\t<span class="token punctuation">[</span>RTCCameraVideoCapturer setupCaptureSession:<span class="token punctuation">]</span> at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:438\n#2\t<span class="token punctuation">[</span>RTCCameraVideoCapturer initWithDelegate:captureSession:<span class="token punctuation">]</span> at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:73\n#1\t<span class="token punctuation">[</span>RTCCameraVideoCapturer initWithDelegate:<span class="token punctuation">]</span> at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:62\n\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-1-2-android" tabindex="-1"><a class="header-anchor" href="#_2-1-2-android" aria-hidden="true">#</a> 2.1.2 Android</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>########################### jni ###########################\nwebrtc::jni::AndroidVideoTrackSource::OnFrameCaptured\n-&gt;android_video_track_source.cc:129\nJava_org_webrtc_NativeAndroidVideoTrackSource_nativeOnFrameCaptured\n-&gt;NativeAndroidVideoTrackSource_jni.h:109\n########################### java ###########################\nonFrameCaptured:58, NativeAndroidVideoTrackSource.java\nnativeAndroidVideoTrackSource.onFrameCaptured(adaptedFrame):73, VideoSource.java\nonFrameCaptured:62, VideoSource.java\nonFrameCaptured:155, CameraCapture.java\nevents.onFrameCaptured:207, Camera2Session.java\nlistener.onFrame(frame):384, SurfaceTextureHelper.java\ntryDeliverTextureFrame:207, SurfaceTextureHelper.java\ncapturer.startCapture(videoWidth, videoHeight, videoFps):960, PeerConnectionClient.java\nsetOnFrameAvailableListener:201, SurfaceTextureHelper.java\nnew SurfaceTextureHelper:75, SurfaceTextureHelper.java\ncreate:64, SurfaceTextureHelper.java\ncreate:92, SurfaceTextureHelper.java\nSurfaceTextureHelper.create: SurfaceTextureHelper.java\ncreateVideoTrack:957, PeerConnectionClient.java\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-1-3-windows" tabindex="-1"><a class="header-anchor" href="#_2-1-3-windows" aria-hidden="true">#</a> 2.1.3 Windows</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>TestVideoCapturer::OnFrame(const VideoFrame&amp; original_frame) test_video_captureer.cc 62\nVcmCapturer::OnFrame(const VideoFrame&amp; frame) vcm_capturer.cc 94\nVideoCaptureImpl::DeliverCapturedFrame(VideoFrame&amp; captureFrame) video_capture_impl.cc 107\nVideoCaptureImpl::IncomingFrame  video_capture_impl.cc 117\nCaptureSinkFilter::ProcessCapturedFrame sink_filter_ds.cc 916\nCaptureInputPin::Receive(IMediaSample* media_sample) sink_filter_ds.cc 732\n\nVideoCaptureDS::StartCapture(const VideoCaptureCapability&amp; capability) video_capture_ds.cc 132\nvcm_-&gt;StartCapture(capability_)  vcm_capturer.cc 55\nVideoCaptureDS::Init(const char* deviceUniqueIdUTF8) video_capture_ds.cc 58\nVideoCaptureImpl::Create video_capture_factory_windows.cc 31\nVideoCaptureFactory::Create video_capture_factory.cc 22\nVcmCapturer::Init vcm_capturer.cc 42\nVcmCapturer::Create vcm_capturer.cc 70\nCapturerTrackSource::Create()  conductor.cc 85\nConductor::AddTracks() conductor.cc 487\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-2-编码" tabindex="-1"><a class="header-anchor" href="#_2-2-编码" aria-hidden="true">#</a> 2.2 编码</h3><p>公共部分:</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#24\twebrtc::VideoStreamEncoder::OnEncodedImage \n-&gt; webrtc/video/video_stream_encoder.cc:1834\n\n...//中间部分在下面的平台编码\n\n#18\twebrtc::VideoStreamEncoder::EncodeVideoFrame \n-&gt; webrtc/video/video_stream_encoder.cc:1760\n#17\twebrtc::VideoStreamEncoder::MaybeEncodeVideoFrame\n-&gt; webrtc/video/video_stream_encoder.cc:1619\n#16\twebrtc::VideoStreamEncoder::OnFrame \n-&gt; webrtc/video/video_stream_encoder.cc:1308\n#15\twebrtc::VideoStreamEncoder::CadenceCallback::OnFrame \n-&gt; webrtc/video/video_stream_encoder.h:152\n#14\twebrtc::(anonymous namespace)::PassthroughAdapterMode::OnFrame(\n-&gt; webrtc/video/frame_cadence_adapter.cc:64\n#13\twebrtc::(anonymous namespace)::FrameCadenceAdapterImpl::OnFrameOnMainQueue\n-&gt; webrtc/video/frame_cadence_adapter.cc:269\n#12\t webrtc::(anonymous namespace)::FrameCadenceAdapterImpl::OnFrame\n-&gt; webrtc/video/frame_cadence_adapter.cc:245\n#11\twebrtc::(anonymous namespace)::FrameCadenceAdapterImpl::OnFrame\n-&gt; webrtc/video/frame_cadence_adapter.cc:239\n#10\trtc::VideoBroadcaster::OnFrame\n-&gt; webrtc/media/base/video_broadcaster.cc:97\n\n//ios &amp; android ,Windows 不执行 跳过， ↑ ↑ ↑ ↑\n#9\trtc::AdaptedVideoTrackSource::OnFrame\n-&gt; webrtc/media/base/adapted_video_track_source.cc:60\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-2-1-硬编码" tabindex="-1"><a class="header-anchor" href="#_2-2-1-硬编码" aria-hidden="true">#</a> 2.2.1 硬编码</h4><h5 id="_2-2-1-1-ios" tabindex="-1"><a class="header-anchor" href="#_2-2-1-1-ios" aria-hidden="true">#</a> 2.2.1.1 IOS</h5><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>↑↑↑↑↑↑↑↑↑↑↑↑\n看上面公共部分代码\n↑↑↑↑↑↑↑↑↑↑↑↑\n\n#23\tinvocation function for block in webrtc::(anonymous namespace)::ObjCVideoEncoder::RegisterEncodeCompleteCallback\n-&gt; webrtc/sdk/objc/native/src/objc_video_encoder_factory.mm:63\n\n#22\t-[RTCVideoEncoderH264 frameWasEncoded:flags:sampleBuffer:\ncodecSpecificInfo:width:height:renderTimeMs:timestamp:rotation:] \n-&gt; webrtc/sdk/objc/components/video_codec/RTCVideoEncoderH264.mm:853\n\n#21 in (anonymous namespace)::compressionOutputCallback\n-&gt; webrtc/sdk/objc/components/video_codec/RTCVideoEncoderH264.mm:161\n\n#20\t-[RTCVideoEncoderH264 encode:codecSpecificInfo:frameTypes:] \n-&gt; webrtc/sdk/objc/components/video_codec/RTCVideoEncoderH264.mm:392\n\n#19\twebrtc::(anonymous namespace)::ObjCVideoEncoder::Encode\n-&gt; webrtc/sdk/objc/native/src/objc_video_encoder_factory.mm:81\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_2-2-1-1-android" tabindex="-1"><a class="header-anchor" href="#_2-2-1-1-android" aria-hidden="true">#</a> 2.2.1.1 Android</h5><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>########################### jni ###########################\n↑↑↑↑↑↑↑↑↑↑↑↑\n看上面公共部分代码\n↑↑↑↑↑↑↑↑↑↑↑↑\n\ncallback_-&gt;OnEncodedImage video_encoder_wrapper.cc:310\nVideoEncoderWrapper::OnEncodedFrame video_encoder_wrapper.cc:258\nJava_org_webrtc_VideoEncoderWrapper_nativeOnEncodedFrame VideoEncoderWrapper_jni.h:41\n########################### java ###########################\nnativeOnEncodedFrame:41 VideoEncoderWrapper.java\ncallback.onEncodedFrame:642 HardwareVideoEncoder.java\ndeliverEncodedImage():565 HardwareVideoEncoder.java\ntextureEglBase.swapBuffers:425  HardwareVideoEncoder.java\nvideoFrameDrawer.drawFrame:424  HardwareVideoEncoder.java\nencodeTextureBuffer:414  HardwareVideoEncoder.java\nencode:344 HardwareVideoEncoder.java\n########################### jni ###########################\nJava_VideoEncoder_encode VideoEncoder_jni.h :492\nwebrtc::jni::VideoEncoderWrapper::Encode\n-&gt;video_encoder_wrapper.cc:147\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_2-2-1-1-windows" tabindex="-1"><a class="header-anchor" href="#_2-2-1-1-windows" aria-hidden="true">#</a> 2.2.1.1 Windows</h5><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>//todo...没有硬编码环境\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="_2-2-3-软编码" tabindex="-1"><a class="header-anchor" href="#_2-2-3-软编码" aria-hidden="true">#</a> 2.2.3 软编码</h4><p><strong>OpenH264:</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>↑↑↑↑↑↑↑↑↑↑↑↑\n看上面公共部分代码\n↑↑↑↑↑↑↑↑↑↑↑↑\nH264EncoderImpl::Encode h264_encoder_impl.cc 365\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-3-编码结束-rtp-打包" tabindex="-1"><a class="header-anchor" href="#_2-3-编码结束-rtp-打包" aria-hidden="true">#</a> 2.3 编码结束 -&gt; RTP 打包</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#36\twebrtc::RtpPacketizerH264::PacketizeStapA\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_format_h264.cc:161\n#35\twebrtc::RtpPacketizerH264::GeneratePackets\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_format_h264.cc:103\n#34\twebrtc::RtpPacketizerH264::RtpPacketizerH264\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_format_h264.cc:62\n#33\twebrtc::RtpPacketizerH264::RtpPacketizerH264\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_format_h264.cc:51\n#32\t\n#31 webrtc::RtpPacketizer::Create\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_format.cc:43\n#30\twebrtc::RTPSenderVideo::SendVideo\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_sender_video.cc:486\n#29\twebrtc::RTPSenderVideo::SendEncodedImage\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_sender_video.cc:774\n#28 webrtc::RtpVideoSender::OnEncodedImage\n-&gt; webrtc/call/rtp_video_sender.cc:600\n#27\twebrtc::internal::VideoSendStreamImpl::OnEncodedImage\n-&gt; webrtc/video/video_send_stream_impl.cc:566\n#26 \n#25 webrtc::VideoStreamEncoder::OnEncodedImage\n-&gt; webrtc/video/video_stream_encoder.cc:1904\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-4-打包完成-pacedsender-队列" tabindex="-1"><a class="header-anchor" href="#_2-4-打包完成-pacedsender-队列" aria-hidden="true">#</a> 2.4 打包完成 -&gt; PacedSender 队列</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#41\twebrtc::PacingController::EnqueuePacket\n-&gt; webrtc/modules/pacing/pacing_controller.cc:241\n#40\twebrtc::TaskQueuePacedSender::EnqueuePackets \n-&gt; webrtc/modules/pacing/task_queue_paced_sender.cc:145\n#39 webrtc::TaskQueuePacedSender::EnqueuePackets\n-&gt; webrtc/modules/pacing/task_queue_paced_sender.cc:140\n#38 webrtc::RTPSender::EnqueuePackets\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_sender.cc:509\n#37 webrtc::RTPSenderVideo::LogAndSendToNetwork\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_sender_video.cc:210\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-5-socket-send" tabindex="-1"><a class="header-anchor" href="#_2-5-socket-send" aria-hidden="true">#</a> 2.5 Socket#send</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#59 ::sendto\n#58 rtc::PhysicalSocket::DoSendTo\n-&gt; webrtc/rtc_base/physical_socket_server.cc:510\n#57 rtc::PhysicalSocket::SendTo\n-&gt; webrtc/rtc_base/physical_socket_server.cc:375\n#56 rtc::AsyncUDPSocket::SendTo\n-&gt; webrtc/rtc_base/async_udp_socket.cc:84\n#55 cricket::UDPPort::SendTo\n-&gt; webrtc/p2p/base/stun_port.cc:286\n#54 cricket::ProxyConnection::Send\n-&gt; webrtc/p2p/base/connection.cc:1371\n#53 cricket::P2PTransportChannel::SendPacket\n-&gt; webrtc/p2p/base/p2p_transport_channel.cc:1616\n#52 cricket::DtlsTransport::SendPacket\n-&gt; webrtc/p2p/base/dtls_transport.cc:417\n#51 webrtc::RtpTransport::SendPacket\n-&gt; webrtc/pc/rtp_transport.cc:147\n#50 webrtc::SrtpTransport::SendRtpPacket\n-&gt; webrtc/pc/srtp_transport.cc:173\n#49 cricket::BaseChannel::SendPacket\n-&gt; webrtc/pc/channel.cc:437\n#48 cricket::BaseChannel::SendPacket\n-&gt; webrtc/pc/channel.cc:318\n#47 cricket::MediaChannel::DoSendPacket\n-&gt; webrtc/media/base/media_channel.cc:163\n#46\t cricket::MediaChannel::SendPacket\n-&gt; webrtc/media/base/media_channel.cc:71\n#45\t cricket::MediaChannel::SendRtp\n-&gt; webrtc/media/base/media_channel.cc:184\n#44\t cricket::WebRtcVideoChannel::SendRtp\n-&gt; webrtc/media/engine/webrtc_video_engine.cc:2058\n#43\t webrtc::RtpSenderEgress::SendPacketToNetwork\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_sender_egress.cc:553\n#42\t webrtc::RtpSenderEgress::SendPacket\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_sender_egress.cc:273\n#41\t webrtc::ModuleRtpRtcpImpl2::TrySendPacket\n-&gt; webrtc/modules/rtp_rtcp/source/rtp_rtcp_impl2.cc:376\n#40\t webrtc::PacketRouter::SendPacket\n-&gt; webrtc/modules/pacing/packet_router.cc:160\n#39\t webrtc::PacingController::ProcessPackets\n-&gt; webrtc/modules/pacing/pacing_controller.cc:585\n#38\twebrtc::TaskQueuePacedSender::MaybeProcessPackets\n-&gt; webrtc/modules/pacing/task_queue_paced_sender.cc:234\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_3-接收" tabindex="-1"><a class="header-anchor" href="#_3-接收" aria-hidden="true">#</a> 3. 接收</h2><h3 id="_3-1-接收-rtp-包" tabindex="-1"><a class="header-anchor" href="#_3-1-接收-rtp-包" aria-hidden="true">#</a> 3.1 接收 RTP 包</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#12\tcricket::WebRtcVideoChannel::OnPacketReceived\n-&gt; webrtc/media/engine/webrtc_video_engine.cc:1744\n#11\tcricket::BaseChannel::OnRtpPacket\n-&gt; webrtc/pc/channel.cc:467\n#10\twebrtc::RtpDemuxer::OnRtpPacket\n-&gt; webrtc/call/rtp_demuxer.cc:249\n#09\twebrtc::RtpTransport::DemuxPacket\n-&gt; webrtc/pc/rtp_transport.cc:194\n#08\twebrtc::SrtpTransport::OnRtpPacketReceived\n-&gt; webrtc/pc/srtp_transport.cc:226\n#07\twebrtc::RtpTransport::OnReadPacket\n-&gt; webrtc/pc/rtp_transport.cc:268\n#06\t cricket::DtlsTransport::OnReadPacket\n-&gt; webrtc/p2p/base/dtls_transport.cc:627\n#05\tcricket::P2PTransportChannel::OnReadPacket\n-&gt; webrtc/p2p/base/p2p_transport_channel.cc:2215\n#04\tcricket::Connection::OnReadPacket\n-&gt; webrtc/p2p/base/connection.cc:465\n#03\tcricket::UDPPort::OnReadPacket\n-&gt; webrtc/p2p/base/stun_port.cc:394\n#02\tcricket::UDPPort::HandleIncomingPacket\n-&gt; webrtc/p2p/base/stun_port.cc:335\n#01\tcricket::AllocationSequence::OnReadPacket\n-&gt; webrtc/p2p/client/basic_port_allocator.cc:1639\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-2-解包-放入缓冲区" tabindex="-1"><a class="header-anchor" href="#_3-2-解包-放入缓冲区" aria-hidden="true">#</a> 3.2 解包 &amp; 放入缓冲区</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#25 webrtc::video_coding::FrameBuffer::InsertFrame\n-&gt; webrtc/modules/video_coding/frame_buffer2.cc:407\n#24 webrtc::internal::VideoReceiveStream2::OnCompleteFrame\n-&gt; webrtc/video/video_receive_stream2.cc:660\n#23 webrtc::RtpVideoStreamReceiver2::OnCompleteFrames\n-&gt; webrtc/video/rtp_video_stream_receiver2.cc:862\n#22 webrtc::RtpVideoStreamReceiver2::OnAssembledFrame\n-&gt; webrtc/video/rtp_video_stream_receiver2.cc:850\n#21 webrtc::RtpVideoStreamReceiver2::OnInsertedPacket\n-&gt; webrtc/video/rtp_video_stream_receiver2.cc:755\n#20 webrtc::RtpVideoStreamReceiver2::OnReceivedPayloadData\n-&gt; webrtc/video/rtp_video_stream_receiver2.cc:620\n#19 webrtc::RtpVideoStreamReceiver2::ReceivePacket\n-&gt; webrtc/video/rtp_video_stream_receiver2.cc:965\n#18 webrtc::RtpVideoStreamReceiver2::OnRtpPacket\n-&gt; webrtc/video/rtp_video_stream_receiver2.cc:654\n#17 webrtc::RtpDemuxer::OnRtpPacket\n-&gt; webrtc/call/rtp_demuxer.cc:249\n#16 webrtc::RtpStreamReceiverController::OnRtpPacket\n-&gt; webrtc/call/rtp_stream_receiver_controller.cc:52\n#15 webrtc::internal::Call::DeliverRtp\n-&gt; webrtc/call/call.cc:1615\n#14\t webrtc::internal::Call::DeliverPacket\n-&gt; webrtc/call/call.cc:1637\n#13\tcricket::WebRtcVideoChannel::OnPacketReceived\n-&gt; webrtc/media/engine/webrtc_video_engine.cc:1748\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-3-解码" tabindex="-1"><a class="header-anchor" href="#_3-3-解码" aria-hidden="true">#</a> 3.3 解码</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#48 rtc::VideoBroadcaster::OnFrame\n-&gt; webrtc/media/base/video_broadcaster.cc:97\n#47 cricket::WebRtcVideoChannel::WebRtcVideoReceiveStream::OnFrame\n-&gt; webrtc/media/engine/webrtc_video_engine.cc:3129\n#46 webrtc::internal::VideoReceiveStream2::OnFrame\n-&gt; webrtc/video/video_receive_stream2.cc:589\n#45 webrtc::IncomingVideoStream::Dequeue\n-&gt; webrtc/common_video/incoming_video_stream.cc:56\n#44 webrtc::IncomingVideoStream::OnFrame\n-&gt; webrtc/common_video/incoming_video_stream.cc:47\n#43 webrtc::IncomingVideoStream::OnFrame\n-&gt; webrtc/common_video/incoming_video_stream.cc:44\n#42 webrtc::internal::VideoStreamDecoder::FrameToRender\n-&gt; webrtc/video/video_stream_decoder2.cc:51\n#41 webrtc::VCMDecodedFrameCallback::Decoded\n-&gt; webrtc/modules/video_coding/generic_decoder.cc:74\n#39\t webrtc::VCMDecodedFrameCallback::Decoded\n-&gt; webrtc/modules/video_coding/generic_decoder.cc:69\n\n\n//....看个平台的实现\n\n#34 webrtc::VCMGenericDecoder::Decode\n-&gt; webrtc/modules/video_coding/generic_decoder.cc:283\n\n#33 webrtc::VideoReceiver2::Decode\n-&gt; webrtc/modules/video_coding/video_receiver2.cc:109\n\n#32 webrtc::internal::VideoReceiveStream2::DecodeAndMaybeDispatchEncodedFrame\n-&gt; webrtc/video/video_receive_stream2.cc:842\n\n#31 webrtc::internal::VideoReceiveStream2::HandleEncodedFrame\n-&gt; webrtc/video/video_receive_stream2.cc:776\n\n#30 webrtc::internal::VideoReceiveStream2::StartNextDecode\n-&gt; webrtc/video/video_receive_stream2.cc:729\n\n#29 webrtc::video_coding::FrameBuffer::StartWaitForNextFrameOnQueue\n-&gt; webrtc/modules/video_coding/frame_buffer2.cc:131\n\n#28 webrtc::RepeatingTaskHandle webrtc::RepeatingTaskHandle::\nDelayedStart&lt;webrtc::video_coding::FrameBuffer::StartWaitForNextFrameOnQueue\n-&gt; webrtc/rtc_base/task_utils/repeating_task.h:130\n\n#27 webrtc::video_coding::FrameBuffer::StartWaitForNextFrameOnQueue\n-&gt; webrtc/modules/video_coding/frame_buffer2.cc:106\n\n#26 webrtc::video_coding::FrameBuffer::InsertFrame\n-&gt; webrtc/modules/video_coding/frame_buffer2.cc:499\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-3-1-硬解码" tabindex="-1"><a class="header-anchor" href="#_3-3-1-硬解码" aria-hidden="true">#</a> 3.3.1 硬解码</h4><h5 id="_3-3-1-1-ios" tabindex="-1"><a class="header-anchor" href="#_3-3-1-1-ios" aria-hidden="true">#</a> 3.3.1.1 IOS</h5><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>↑↑↑↑↑↑↑↑↑↑↑↑\n看上面公共部分代码\n↑↑↑↑↑↑↑↑↑↑↑↑\n\n#38\twebrtc::(anonymous namespace)::ObjCVideoDecoder::RegisterDecodeCompleteCallback(\n-&gt; webrtc/sdk/objc/native/src/objc_video_decoder_factory.mm:70\n\n\n#37\tdecompressionOutputCallback\n-&gt; webrtc/sdk/objc/components/video_codec/RTCVideoDecoderH264.mm:53\n\n#36 -[RTCVideoDecoderH264 decode:missingFrames:codecSpecificInfo:renderTimeMs:] \n-&gt; webrtc/sdk/objc/components/video_codec/RTCVideoDecoderH264.mm:107\n#35\twebrtc::(anonymous namespace)::ObjCVideoDecoder::Decode\n-&gt; webrtc/sdk/objc/native/src/objc_video_decoder_factory.mm:51\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_3-3-1-2-android" tabindex="-1"><a class="header-anchor" href="#_3-3-1-2-android" aria-hidden="true">#</a> 3.3.1.2 Android</h5><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>↑↑↑↑↑↑↑↑↑↑↑↑\n看上面公共部分代码\n↑↑↑↑↑↑↑↑↑↑↑↑\n########################### jni ###########################\nwebrtc::jni::VideoDecoderWrapper video_deocder_wrapper.cc 191\nJava_org_webrtc_VideoDecoderWrapper_nativeOnDecodedFrame VideoDecoderWrapper_jni.cc 50\nJava_org_webrtc_VideoDecoderWrapper_nativeOnDecodedFrame VideoDecoderWrapper_jni.cc 41\n########################### java ###########################\nlambda$createDecoderCallback$0:22, VideoDecoderWrapper.java\nonFrame:451, AndroidVideoDecoder.java\ntryDeliverTextureFrame:384, SurfaceTextureHelper.java\nlambda$new$tryDeliverTextureFrame$SurfaceTextureHelper:207, SurfaceTextureHelper.java\ndeliverDecodedFrame:402, AndroidVideoDecoder.java\ndecode:209, AndroidVideoDecoder.java\n########################### jni ###########################\nJava_VideoDecoder_decode VideoDecoder_jni.cc 146\nwebrtc::jni::VideoDecoderWrapper::Decode video_decoder_wrapper.cc 123\nwebrtc::VideoDecoderSoftwareFallbackWrapper video_decoder_software_fallback_wrapper.cc 187\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="_3-3-1-3-windows" tabindex="-1"><a class="header-anchor" href="#_3-3-1-3-windows" aria-hidden="true">#</a> 3.3.1.3 Windows</h5><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>//todo ... 没有硬解码环境\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="_3-3-2-软解码" tabindex="-1"><a class="header-anchor" href="#_3-3-2-软解码" aria-hidden="true">#</a> 3.3.2 软解码</h4><p><strong>FFmpeg h264:</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>↑↑↑↑↑↑↑↑↑↑↑↑\n看上面公共部分代码\n↑↑↑↑↑↑↑↑↑↑↑↑\nH264DecoderImpl::Decode h264_decoder_impl.cc 256\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-4-视频渲染" tabindex="-1"><a class="header-anchor" href="#_3-4-视频渲染" aria-hidden="true">#</a> 3.4 视频渲染</h3><h4 id="_3-4-1-ios" tabindex="-1"><a class="header-anchor" href="#_3-4-1-ios" aria-hidden="true">#</a> 3.4.1 IOS</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#51\t -[RTCMTLVideoView renderFrame:] \n-&gt; webrtc/sdk/objc/components/renderer/metal/RTCMTLVideoView.m:253\n#50\t webrtc::VideoRendererAdapter::OnFrame\n-&gt; webrtc/sdk/objc/api/RTCVideoRendererAdapter.mm:40\n#49\t webrtc::VideoRendererAdapter::OnFrame\n-&gt; webrtc/sdk/objc/api/RTCVideoRendererAdapter.mm:30\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-4-2-android" tabindex="-1"><a class="header-anchor" href="#_3-4-2-android" aria-hidden="true">#</a> 3.4.2 Android</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>########################### java ###########################\neglBase.swapBuffers:669 EglRenderer.java\nframeDrawer.drawFrame:664 EglRenderer.java\nrenderFrameOnRenderThread:597 EglRenderer.java\nonFrame:102 SurfaceEglRenderer.java\nonFrame:184 SurfaceVideoRenderer.java\nonFrame:138, CallActivity$ProxyVideoSink.java\n########################### jni ###########################\nJava_VideoSink_onFrame VideoSink_jni.h 43\nwebrtc::jni::VideoSinkWrapper::OnFrame video_sink.cc 24\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-4-3-windows" tabindex="-1"><a class="header-anchor" href="#_3-4-3-windows" aria-hidden="true">#</a> 3.4.3 Windows</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>MainWnd::VideoRenderer::OnFrame(const webrtc::VideoFrame&amp; video_frame) main_wnd.cc 613\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>通过该篇文章我们已经大致熟悉了 WebRTC 在 IOS 、Android 、Windows 平台上的视频数据流程，在阅读代码的过程中，我们可以看一下它是如何做到的跨平台，相关跨平台的 API 又是如何设计的？这些都是值得我们去学习的。</p><h2 id="参考" tabindex="-1"><a class="header-anchor" href="#参考" aria-hidden="true">#</a> 参考</h2>',66),a={href:"https://dabaojian.blog.csdn.net/article/details/123012882",target:"_blank",rel:"noopener noreferrer"},c={href:"https://blog.csdn.net/sonysuqin/article/details/106629343",target:"_blank",rel:"noopener noreferrer"},s={},t=(0,i(3744).Z)(s,[["render",function(e,n){const i=(0,d.up)("ExternalLinkIcon");return(0,d.wg)(),(0,d.iD)("div",null,[r,(0,d._)("ul",null,[(0,d._)("li",null,[(0,d._)("a",a,[(0,d.Uk)("WebRTC Native M96 视频发送编码(OpenH264)流程以及接收视频包解码(FFmpeg)播放流程"),(0,d.Wm)(i)])]),(0,d._)("li",null,[(0,d._)("a",c,[(0,d.Uk)("WebRTC视频JitterBuffer详解"),(0,d.Wm)(i)])])])])}]])}}]);