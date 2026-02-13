---
title: "基于瑞芯微RK3588S平台的ILI9486 SPI显示屏子系统"
date: 2026年02月14日 00:05:40
draft: false
description: "这是第一篇文章，介绍博客的技术栈和功能特性"
categories: ["博客"]
tags: ["博客", "Hugo", "瑞芯微RK3588S"]
series: ["瑞芯微RK3588S"]
series_order: 1
---

# **基于瑞芯微 RK3588S 平台的 ILI9486 SPI 显示屏子系统：从硬件集成到 TinyDRM/FBTFT 驱动落地的全栈方案**

在嵌入式系统开发领域，瑞芯微（Rockchip）RK3588S 作为一款高性能、低功耗的八核 64 位处理器，其强大的图形处理能力和丰富的接口资源使其成为边缘计算、智能座舱和高级显示应用的首选方案 1。然而，在许多工业控制或小型监控设备中，开发者往往需要通过串行外设接口（SPI）连接低分辩率的副屏，例如基于伊利泰克（Ilitek）ILI9486 控制器的 3.5 英寸 TFT 液晶屏 3。尽管 RK3588S 拥有高达 8K 的视频编解码能力，但要在 Linux 内核下稳定、高效地驱动一块 SPI 接口的显示屏，仍涉及到硬件电气连接、内核驱动架构选择（FBTFT 或 TinyDRM）、设备树（Device Tree）配置、初始化寄存器微调以及用户态显示管理的深度集成 5。

## **RK3588S 硬件架构中的 SPI 总线子系统与电气特性**

RK3588S 芯片内部集成了一系列高性能 SPI 控制器，这些控制器不仅支持全双工、半双工和单工传输模式，还具备内置的先进先出存储器（FIFO）和直接内存访问（DMA）能力，这对于显示应用至关重要 8。在物理引脚分配上，RK3588S 的 SPI 控制器通常与 GPIO 引脚复用，开发者必须通过引脚复用（Pinmux）配置来确保总线信号能够正确路由到对应的硬件扩展头 10。

### **SPI 控制器的技术规范与带宽计算**

RK3588S 的 SPI 控制器在主机模式（Master Mode）下的最高接口速率理论上可达 50 MHz，这为驱动 ILI9486 提供了必要的物理层带宽保障 8。ILI9486 控制器的标准分辩率为 320x480，在使用 16 位颜色深度（RGB565）的情况下，刷新一帧图像所需的数据量可以通过数学公式进行估算： $$Total\_Bits \= Width \\times Height \\times Bit\_Depth \= 320 \\times 480 \\times 16 \= 2,457,600 \\text{ bits}$$若要实现 30 FPS 的刷新率，所需的最低传输带宽为：

![][image1]  
显然，50 MHz 的 SPI 速率在实际应用中会受到协议开销和信号完整性的限制，通常 30 FPS 的帧率在 SPI 总线下已接近理论极限，实际应用中建议将 SPI 频率配置在 32 MHz 到 40 MHz 之间，以获得最佳的稳定性和刷新平衡 12。

| 参数名称 | RK3588S SPI 控制器规格 | ILI9486 驱动要求与影响 |
| :---- | :---- | :---- |
| 最大时钟频率 | 50 MHz (Master) 8 | 决定显示刷新率上限，建议配置为 32-40 MHz 12 |
| FIFO 深度 | 64 字节 (32-bit entries) 9 | 超过此阈值将自动触发 DMA 传输，降低 CPU 负载 |
| DMA 集成 | 支持 PL330 DMA 引擎 14 | 对于 320x480 全屏像素更新至关重要 |
| I/O 电平标准 | 3.3V (逻辑电平兼容性高) 11 | 与大多数 ILI9486 模块直接兼容，无需电平转换 |

### **硬件引脚分配与引脚复用逻辑**

在具体的硬件落地过程中，以常见的 Orange Pi 5 (RK3588S) 和 Radxa Rock 5A 为例，开发者通常使用 26 针或 40 针扩展接口 11。引脚复用是 RK3588S 平台最容易出现冲突的环节。例如，SPI4 控制器在 Orange Pi 5 上被引出，但其引脚可能与 I2C 或 UART 存在功能重叠，因此在设备树中必须显式禁用冲突的节点 10。

下表详细列出了在不同主流 RK3588S 开发板上连接 ILI9486 屏所需的关键引脚映射：

| 功能定义 | 信号缩写 | Rock 5A 物理引脚 (SPI0 M1) | Orange Pi 5 物理引脚 (SPI4 M0) | 说明 |
| :---- | :---- | :---- | :---- | :---- |
| 时钟信号 | SCLK | Pin 36 (GPIO4\_A2) 11 | Pin 23 (GPIO1\_A2) 15 | 建议走线长度控制在 10cm 内 |
| 数据输出 | MOSI | Pin 12 (GPIO4\_A1) 11 | Pin 19 (GPIO1\_A1) 15 | 主机发送像素数据至屏 |
| 片选信号 | CS | Pin 40 (GPIO4\_B1) 11 | Pin 24 (GPIO1\_A3) 15 | 低电平有效 |
| 数据/命令切换 | DC/RS | Pin 18 (GPIO1\_B0) | Pin 18 (GPIO1\_D7) | 由驱动软件通过 GPIO 控制 |
| 硬件复位 | RESET | Pin 16 (GPIO1\_A5) | Pin 16 (GPIO1\_D6) | 上电初始化时需拉低复位 |
| 背光控制 | BLK | Pin 15 (GPIO4\_B4) | Pin 15 (GPIO4\_C2) | 可连接至 PWM 引脚实现调光 |

## **驱动架构选型：FBTFT 帧缓冲与现代 TinyDRM 系统**

在 RK3588S 的 Linux 系统中，驱动 ILI9486 存在两条主要的技术路径：一种是成熟但被视为传统的 FBTFT 驱动，另一种是符合现代 Linux 图形标准的 TinyDRM 驱动 6。

### **FBTFT (Framebuffer TFT) 驱动深度解析**

FBTFT 驱动架构起源于对小型 SPI 显示器提供快速支持的需求。在 RK3588S 的 5.10 版本内核中，FBTFT 通常位于 drivers/staging/fbtft/ 目录下 18。该驱动的核心逻辑是创建一个 /dev/fb1 虚拟帧缓冲设备。当系统或应用程序向该缓冲区写入数据时，驱动会识别出“脏矩形”（Dirty Region），即发生改变的像素区域，并将其通过 SPI 协议打包发送给 ILI9486 寄存器 13。

FBTFT 的优势在于其配置的高度灵活性。开发者可以直接在设备树或模块加载参数中定义复杂的初始化序列（Init String），这对于处理市场上流通的各种 ILI9486 克隆版屏幕至关重要 19。然而，FBTFT 已被 Linux 社区标注为过时（Staging），且它不支持现代显示服务器（如 Wayland）所需的原子模式设置（Atomic Modesetting）和硬件平面（Planes）概念 21。

### **TinyDRM 驱动与 DRM/KMS 架构集成**

TinyDRM 是现代 Linux 图形子系统（Direct Rendering Manager）的一个分支，旨在为简单的 SPI 或 I2C 显示器提供标准化支持 7。对于 ILI9486，内核源码中对应的驱动文件通常是 drivers/gpu/drm/tiny/ili9486.c 23。

TinyDRM 架构将显示屏抽象为一个标准的 DRM 控制器。这意味着开发者可以使用 libdrm 库中的工具（如 modetest）进行调试，并且可以将该屏作为显示输出终端无缝接入图形桌面环境 24。TinyDRM 内部使用了 MIPI DBI（Display Bus Interface）层来管理总线传输，这在代码结构上比 FBTFT 更加优雅，且更符合上游内核的发展趋势 23。对于追求长期维护和现代特性的 RK3588S 项目，TinyDRM 是首选方案。

## **落地实施：内核配置与驱动模块编译**

要使驱动在 RK3588S 平台上落地，首先需要确保 Linux 内核包含了必要的驱动模块。无论是官方的 Rockchip SDK 还是社区维护的镜像（如 Armbian），通常都需要在编译前对 .config 文件进行微调 4。

### **内核编译选项配置**

对于 ILI9486 的驱动，需要在内核配置界面（make menuconfig）中启用以下关键路径：

| 驱动框架 | 内核配置路径 | 配置项名称 |
| :---- | :---- | :---- |
| 核心 SPI 支持 | Device Drivers \-\> SPI support | CONFIG\_SPI\_ROCKCHIP 8 |
| 现代 TinyDRM | Device Drivers \-\> Graphics support \-\> DRM Support for ILI9486 | CONFIG\_TINYDRM\_ILI9486 22 |
| 传统 FBTFT | Device Drivers \-\> Staging drivers \-\> Support for small TFT LCD display modules | CONFIG\_FB\_TFT\_ILI9486 18 |
| 触摸屏支持 | Device Drivers \-\> Input device support \-\> Touchscreens | CONFIG\_TOUCHSCREEN\_ADS7846 3 |

在配置完成后，使用 RK3588S 的 SDK 工具链进行编译。例如在 Firefly 或 Orange Pi 的 SDK 中，通常执行 ./build.sh kernel 来生成新的内核镜像和设备树文件 4。编译生成的 .ko 驱动模块会存放于 /lib/modules/\<kernel-version\>/ 目录下，系统启动时会根据设备树的匹配情况自动加载 6。

## **设备树（Device Tree）的深度定制与匹配**

设备树是连接硬件引脚与软件驱动的灵魂。在 RK3588S 平台上，设备树通常由多个 .dtsi 包含文件组成。开发者需要创建一个覆盖（Overlay）文件或直接在主板级 .dts 中添加 SPI 显示节点 16。

### **编写 SPI 节点描述**

在设备树中，ILI9486 屏被定义为 SPI 总线上的一个从设备。以下是一个针对 RK3588S SPI4 接口的典型配置示例：

DTS

\&spi4 {  
    status \= "okay";  
    \#address-cells \= ;  
    \#size-cells \= ;  
    pinctrl-names \= "default";  
    pinctrl\-0 \= \<\&spi4m0\_pins\>; /\* 引脚复用配置 \*/

    ili9486: ili9486@0 {  
        compatible \= "ilitek,ili9486";  
        reg \= ; /\* 对应片选 CS0 \*/  
        spi-max-frequency \= ; /\* 配置时钟频率 \*/  
        rotate \= ; /\* 屏幕旋转角度 \*/  
        fps \= ; /\* 期望帧率 \*/  
        buswidth \= ; /\* 总线宽度 8位 \*/  
        dc-gpios \= \<\&gpio1 RK\_PD7 GPIO\_ACTIVE\_HIGH\>; /\* 数据命令引脚 \*/  
        reset-gpios \= \<\&gpio1 RK\_PD6 GPIO\_ACTIVE\_LOW\>; /\* 复位引脚 \*/  
        debug \= ;  
    };  
};

### **GPIO 编号的计算机制**

RK3588S 的 GPIO 编号在设备树中并不使用简单的整数，而是通过控制组、端口和引脚号来定义 2。对于 \&gpio1 RK\_PD7，其背后的物理意义是：GPIO1 控制器的第 4 个组（D 组）的第 7 个引脚。在内核驱动中，这些标识符会被解析为唯一的 GPIO 整数 ID。计算公式通常为：

![][image2]  
其中 A、B、C、D 组对应的 Group\_Index 分别为 0, 1, 2, 3。准确配置 GPIO 属性是解决“驱动已加载但屏幕无反应”这一常见问题的关键。

## **ILI9486 控制器寄存器初始化与图像优化**

ILI9486 是一款复杂的控制芯片，其内部拥有数百个寄存器，用于控制电荷泵、伽马校正、扫描方向以及像素格式 12。市面上流通的 3.5 英寸 SPI 屏往往使用了不同的玻璃面板，这意味着同一套驱动在不同屏上可能会出现反色、镜像或偏移现象 5。

### **核心寄存器配置表**

为了实现正确的显示效果，驱动必须在启动时向 ILI9486 发送初始化序列。以下是几个至关重要的寄存器设置：

| 寄存器指令 | 功能描述 | 推荐值 | 效果说明 |
| :---- | :---- | :---- | :---- |
| 0x36 | 存储器访问控制 (MADCTL) | 0x28 或 0x48 12 | 决定显示扫描方向，用于修复水平或垂直镜像 |
| 0x3A | 接口像素格式 (COLMOD) | 0x55 12 | 设置为 16-bit/pixel (RGB565)，平衡画质与带宽 |
| 0xB4 | 显示反转控制 | 0x02 12 | 若屏幕出现“底片”效果，需调整此值以修复反色 |
| 0xB6 | 显示功能控制 | 0x02 0x02 12 | 调整 SS (Source Scan) 和 GS (Gate Scan) 方向 |

### **解决镜像与位移问题**

对于 ILI9486 而言，镜像问题最常发生。由于 SPI 屏的物理安装方向多种多样，MADCTL (0x36h) 寄存器的位定义成为了调试核心。该寄存器的第 7、6、5 位分别控制分页地址顺序、列地址顺序和行列交换 12。如果开发者发现显示的文字是左右反转的，通常需要将该寄存器的值从 0x48 改为 0x28。此外，某些廉价的 ILI9486 克隆板在 SPI 模式下可能需要特殊的 16 位传输命令，TinyDRM 驱动中的 waveshare\_command 函数正是为此类特殊硬件设计的，它通过将 8 位命令封装在 16 位传输块中来确保兼容性 23。

## **性能调优：DMA、RSD 与硬件加速协作**

在 RK3588S 这种高性能平台上，SPI 驱动不应成为系统的性能负担。通过启用 DMA 传输和调整采样延迟，可以显著提升显示流畅度并降低内核占用 9。

### **启用 SPI DMA 传输**

RK3588S 的 SPI 驱动（spi-rockchip.c）具有自动 DMA 切换机制。默认情况下，当单次传输的数据长度超过 FIFO 深度（通常为 64 字节）时，驱动会向 DMA 引擎申请传输通道 9。由于 ILI9486 的一行像素数据（320 像素 ![][image3] 2 字节 \= 640 字节）远超此限制，全屏刷新基本上全程由 DMA 接管 9。开发者应在设备树的 SPI 节点中保留 dmas 和 dma-names 属性，以确保该机制生效。

### **读采样延迟（RSD）优化**

在 SPI 时钟频率提高到 32 MHz 以上时，导线上的分布式电容和信号反射会导致采样错位。RK3588S 支持 rockchip,read-sample-delay-ns 属性，通过在设备树中微调此参数（通常为 0-3 个时钟周期延迟），可以消除高频下的花屏或噪声点 9。

### **帧缓冲克隆 (FBCP) 与 RGA 加速**

由于 SPI 显示屏在系统中通常挂载为 /dev/fb1，而 RK3588S 的 GPU 和视频硬解码器默认输出到 /dev/fb0（HDMI 或 LCD），要让 SPI 屏显示主屏内容，需要使用“帧缓冲克隆”技术 13。传统的 fbcp 工具通过 CPU 轮询拷贝内存，这在 RK3588S 上会造成不必要的开销。

推荐方案是利用 RK3588S 内置的 RGA（Raster Graphic Acceleration）硬件引擎。RGA 可以在极低的 CPU 占用率下完成图像的缩放、旋转和格式转换。通过编写简单的 C 程序调用 RGA API，可以将 1080P 的主屏图像实时缩放并推送到 320x480 的 ILI9486 缓冲区。这种方式能够实现丝滑的系统级镜像显示 2。

## **触摸子系统集成：ADS7846 驱动方案**

大多数 ILI9486 模块集成了电阻式触摸屏，其控制芯片通常是 ADS7846 或 XPT2046。在硬件上，触摸芯片共享 SPI 总线，但拥有独立的片选（CS1）和中断引脚（PENIRQ） 3。

### **触摸芯片设备树配置**

触摸芯片在设备树中必须作为一个独立的子节点存在，且需要正确配置中断触发方式：

DTS

\&spi4 {  
    ads7846: touchscreen@1 {  
        compatible \= "ti,ads7846";  
        reg \= ; /\* 使用 CS1 \*/  
        spi-max-frequency \= ;  
        interrupt-parent \= \<\&gpio4\>;  
        interrupts \= \<RK\_PB2 IRQ\_TYPE\_LEVEL\_LOW\>;  
        pendown-gpio \= \<\&gpio4 RK\_PB2 GPIO\_ACTIVE\_LOW\>;  
        vcc-supply \= \<\&vcc3v3\_lcd\>;  
        /\* 触摸压力与范围参数 \*/  
        ti,x-min \= ;  
        ti,y-min \= ;  
        ti,x-max \= ;  
        ti,y-max \= ;  
        ti,pressure-max \= ;  
    };  
};

加载驱动后，系统会生成一个新的输入设备 /dev/input/eventX。开发者可以使用 xinput-calibrator 工具进行四点校准。校准生成的参数需要写入 /usr/share/X11/xorg.conf.d/40-libinput.conf 中，以确保触摸坐标与显示像素完美对齐 17。

## **用户态配置：从控制台终端到图形界面**

硬件和驱动就绪后，最后一步是将系统的输出流重定向到 ILI9486 屏幕上。

### **映射控制台终端 (fbcon)**

如果希望在启动时看到 Linux 的“小企鹅”Logo 和内核日志，需要在内核启动参数（bootargs）中加入 fbcon 映射指令 19。在 RK3588S 的启动配置文件中添加： console=tty1 fbcon=map:1 fbcon=rotate:1 这里的 map:1 表示将虚拟终端 1 绑定到第 2 个帧缓冲设备（/dev/fb1）。rotate:1 用于在内核层实现 90 度旋转，使日志在横屏模式下正常显示 37。

### **X11 与图形桌面配置**

对于使用 X11 桌面环境的系统（如 Debian 或 Ubuntu 桌面版），需要修改 Xorg 的配置文件，强制其使用 fbdev 驱动指向 SPI 屏 19。在 /etc/X11/xorg.conf.d/99-fbdev.conf 中写入：

代码段

Section "Device"  
    Identifier "my\_spi\_lcd"  
    Driver "fbdev"  
    Option "fbdev" "/dev/fb1"  
EndSection

这种配置会使整个图形界面渲染到 SPI 屏上。如果需要主屏（HDMI）和副屏（SPI）同时显示不同内容，则需要配合 xrandr 或使用基于 DRM 框架的现代窗口管理器（如 Sway 或 Wayland 组合器），它们可以同时管理多个显卡节点 25。

## **落地故障排除与硬件调试指南**

在 RK3588S 上驱动 ILI9486 的过程中，开发者常会遇到各种棘手问题。建立科学的调试流程可以快速定位故障。

### **常见故障诊断**

1. **白屏现象**：这通常意味着 SPI 通信尚未建立或复位序列未生效。首先检查 SPI 片选信号是否拉低，然后使用万用表测量 RESET 引脚在驱动加载时是否有从低到高的电平跳变 5。  
2. **花屏或显示偏移**：多由于 spi-max-frequency 过高或设备树中定义的 Width 与 Height 不符 13。降低频率到 10 MHz 观察是否恢复正常。  
3. **驱动冲突**：如果 SPI 引脚被其他驱动（如 spidev）占用，ILI9486 驱动将无法成功绑定。使用 ls \-l /sys/bus/spi/devices/ 查看当前总线挂载的设备情况 40。

### **信号完整性与布线建议**

RK3588S 的 SPI 信号频率较高，且其引脚驱动能力（Drive Strength）可以通过设备树调节 11。对于通过杜邦线连接的 ILI9486 屏，建议在引脚配置（Pinctrl）中将 SPI 引脚的驱动强度设置为 8mA 或 12mA。同时，务必保证显示屏与开发板共地（Common Ground），并在电源线上并联一个 10uF 的钽电容以滤除高频噪声 42。

## **结论**

在瑞芯微 RK3588S 平台上驱动 ILI9486 是一项系统工程，它不仅要求开发者掌握底层总线的电气特性，更要求其对现代 Linux 驱动架构有深刻的理解。虽然 FBTFT 在配置上更为直观，但 TinyDRM 凭借其与 DRM/KMS 子系统的原生集成，已成为高性能嵌入式设备的主流选择。通过合理的设备树配置、基于 DMA 的性能优化以及 RGA 硬件加速的协作，开发者可以在 RK3588S 上实现稳定、高效的小尺寸 SPI 显示方案。这套方案不仅适用于简单的信息显示，更可以扩展至复杂的图形交互和多屏协同场景，充分释放了 RK3588S 在边缘显示领域的潜能。

#### **引用的著作**

1. 10\. SPI — Firefly Wiki, 访问时间为 二月 13, 2026， [https://wiki.t-firefly.com/en/ROC-RK3588-PC/usage\_spi.html](https://wiki.t-firefly.com/en/ROC-RK3588-PC/usage_spi.html)  
2. User's Hardware Manual\_V1.5 \- Forlinx Embedded Documentation, 访问时间为 二月 13, 2026， [https://docs.forlinx.net/rockchip/ok3588-c/OK3588-C\_User\_Hardware\_Manual.html](https://docs.forlinx.net/rockchip/ok3588-c/OK3588-C_User_Hardware_Manual.html)  
3. SPI LCD Adaptation Method | Radxa Docs, 访问时间为 二月 13, 2026， [https://docs.radxa.com/en/rock3/rock3b/low-level-dev/spi-lcd](https://docs.radxa.com/en/rock3/rock3b/low-level-dev/spi-lcd)  
4. Orange Pi 5 Plus \- Wiki-Orange Pi, 访问时间为 二月 13, 2026， [http://www.orangepi.org/orangepiwiki/index.php/Orange\_Pi\_5\_Plus](http://www.orangepi.org/orangepiwiki/index.php/Orange_Pi_5_Plus)  
5. Ili9486 drivers \- Support \- Pimoroni Buccaneers, 访问时间为 二月 13, 2026， [https://forums.pimoroni.com/t/ili9486-drivers/25393](https://forums.pimoroni.com/t/ili9486-drivers/25393)  
6. Where is tinydrm driver located? \- Raspberry Pi Forums, 访问时间为 二月 13, 2026， [https://forums.raspberrypi.com/viewtopic.php?t=365869](https://forums.raspberrypi.com/viewtopic.php?t=365869)  
7. ili9486.c source code \[linux/drivers/gpu/drm/tiny/ili9486.c\] \- Codebrowser, 访问时间为 二月 13, 2026， [https://codebrowser.dev/linux/linux/drivers/gpu/drm/tiny/ili9486.c.html](https://codebrowser.dev/linux/linux/drivers/gpu/drm/tiny/ili9486.c.html)  
8. SPI | Bit-Brick, 访问时间为 二月 13, 2026， [https://docs.bit-brick.com/docs/ssom\_3576/software/peripheral\_driver/QSPI](https://docs.bit-brick.com/docs/ssom_3576/software/peripheral_driver/QSPI)  
9. SPI Developer Guide – Tianmao Technology Co., Ltd \- Cool Pi, 访问时间为 二月 13, 2026， [https://www.cool-pi.com/docs/spi-developer-guide/](https://www.cool-pi.com/docs/spi-developer-guide/)  
10. Raspberry Pi 5 and 6 SPI screens, 访问时间为 二月 13, 2026， [https://forums.raspberrypi.com/viewtopic.php?t=365731](https://forums.raspberrypi.com/viewtopic.php?t=365731)  
11. Hardware Interface Description \- ROCK 5A \- Radxa Docs, 访问时间为 二月 13, 2026， [https://docs.radxa.com/en/rock5/rock5a/hardware-design/hardware-interface](https://docs.radxa.com/en/rock5/rock5a/hardware-design/hardware-interface)  
12. Driving the ili9488 LCD (4.0 inch cheap chinese clone) \- Allwinner ..., 访问时间为 二月 13, 2026， [https://forum.armbian.com/topic/47971-driving-the-ili9488-lcd-40-inch-cheap-chinese-clone/](https://forum.armbian.com/topic/47971-driving-the-ili9488-lcd-40-inch-cheap-chinese-clone/)  
13. Performance testing for more tiny TFTs · Issue \#418 · notro/fbtft \- GitHub, 访问时间为 二月 13, 2026， [https://github.com/notro/fbtft/issues/418](https://github.com/notro/fbtft/issues/418)  
14. FBTFT kernel with SPI DMA (FBCP Support) · Issue \#265 · notro/fbtft \- GitHub, 访问时间为 二月 13, 2026， [https://github.com/notro/fbtft/issues/265](https://github.com/notro/fbtft/issues/265)  
15. 26 Pin Interface Pin Description \- Wiki-Orange Pi, 访问时间为 二月 13, 2026， [http://www.orangepi.org/orangepiwiki/index.php/26\_Pin\_Interface\_Pin\_Description](http://www.orangepi.org/orangepiwiki/index.php/26_Pin_Interface_Pin_Description)  
16. FriendlyElec CM3588 edit device tree \- Stack Overflow, 访问时间为 二月 13, 2026， [https://stackoverflow.com/questions/79808144/friendlyelec-cm3588-edit-device-tree](https://stackoverflow.com/questions/79808144/friendlyelec-cm3588-edit-device-tree)  
17. Setting Up a TFT Touchscreen on a Raspberry Pi with a fbtft Linux Driver | Chrizog, 访问时间为 二月 13, 2026， [https://chrizog.com/rpi-linux-fbtft-touchscreen-setup](https://chrizog.com/rpi-linux-fbtft-touchscreen-setup)  
18. kernel-5.10/drivers/staging/fbtft/Kconfig · e12ba531a1ef63b99ce4d8b17b9daf2ea30f69ec · Rockchip / Firefly / RK3588\_Android12 · GitLab, 访问时间为 二月 13, 2026， [https://gitlabhost.argos-navy.ru/rockchip/firefly/rk3588\_android12/-/blob/e12ba531a1ef63b99ce4d8b17b9daf2ea30f69ec/kernel-5.10/drivers/staging/fbtft/Kconfig](https://gitlabhost.argos-navy.ru/rockchip/firefly/rk3588_android12/-/blob/e12ba531a1ef63b99ce4d8b17b9daf2ea30f69ec/kernel-5.10/drivers/staging/fbtft/Kconfig)  
19. Setting up TonTec 3.5 Inch TFT using the fbtft driver | cooljc.me.uk, 访问时间为 二月 13, 2026， [https://cooljc.me.uk/?p=64](https://cooljc.me.uk/?p=64)  
20. 目录 \- Gitee, 访问时间为 二月 13, 2026， [https://gitee.com/YES-LCD-GUI/fbtft/wikis/pages/export?doc\_id=711969\&type=pdf](https://gitee.com/YES-LCD-GUI/fbtft/wikis/pages/export?doc_id=711969&type=pdf)  
21. Orange Pi Zero 3 ili9486 TFT LCD \- Page 3 \- Allwinner sunxi ..., 访问时间为 二月 13, 2026， [https://forum.armbian.com/topic/46824-orange-pi-zero-3-ili9486-tft-lcd/page/3/](https://forum.armbian.com/topic/46824-orange-pi-zero-3-ili9486-tft-lcd/page/3/)  
22. config\_tinydrm\_ili9486 \- kernelconfig.io, 访问时间为 二月 13, 2026， [https://www.kernelconfig.io/config\_tinydrm\_ili9486](https://www.kernelconfig.io/config_tinydrm_ili9486)  
23. linux/drivers/gpu/drm/tiny/ili9486.c at master · torvalds/linux \- GitHub, 访问时间为 二月 13, 2026， [https://github.com/torvalds/linux/blob/master/drivers/gpu/drm/tiny/ili9486.c](https://github.com/torvalds/linux/blob/master/drivers/gpu/drm/tiny/ili9486.c)  
24. Modetest for Display Link Up \- UG1449, 访问时间为 二月 13, 2026， [https://docs.amd.com/r/en-US/ug1449-multimedia/Modetest-for-Display-Link-Up](https://docs.amd.com/r/en-US/ug1449-multimedia/Modetest-for-Display-Link-Up)  
25. modetest \- AMD Adaptive Computing Wiki \- Confluence, 访问时间为 二月 13, 2026， [https://xilinx-wiki.atlassian.net/wiki/display/A/Video\_Mixer](https://xilinx-wiki.atlassian.net/wiki/display/A/Video_Mixer)  
26. By Thread \- Linux-Kernel Archive, 访问时间为 二月 13, 2026， [https://lkml.iu.edu/hypermail/linux/kernel/2405.1/index.html](https://lkml.iu.edu/hypermail/linux/kernel/2405.1/index.html)  
27. 1\. Linux Device Tree (DTS) Manual — Firefly Wiki, 访问时间为 二月 13, 2026， [https://wiki.t-firefly.com/en/iCore-3588MQ/linux\_dts\_manual.html](https://wiki.t-firefly.com/en/iCore-3588MQ/linux_dts_manual.html)  
28. Update 5.10.160 to 6.1 · Joshua-Riek ubuntu-rockchip · Discussion \#725 \- GitHub, 访问时间为 二月 13, 2026， [https://github.com/Joshua-Riek/ubuntu-rockchip/discussions/725](https://github.com/Joshua-Riek/ubuntu-rockchip/discussions/725)  
29. RK3588 Device Tree Configuration | FydeOS Help Center, 访问时间为 二月 13, 2026， [https://fydeos.io/help/knowledge-base/developer-options/hardware-configuration/rk3588-device-tree-configuration/](https://fydeos.io/help/knowledge-base/developer-options/hardware-configuration/rk3588-device-tree-configuration/)  
30. forlinx embedded's pages | Hackaday.io, 访问时间为 二月 13, 2026， [https://hackaday.io/pages/1381346](https://hackaday.io/pages/1381346)  
31. LCD ( ILI9486 Panel) initial code question \- Processors forum \- TI E2E, 访问时间为 二月 13, 2026， [https://e2e.ti.com/support/processors-group/processors/f/processors-forum/213245/lcd-ili9486-panel-initial-code-question](https://e2e.ti.com/support/processors-group/processors/f/processors-forum/213245/lcd-ili9486-panel-initial-code-question)  
32. Understanding how TFT driver operates (ILI9486) \- Electrical Engineering Stack Exchange, 访问时间为 二月 13, 2026， [https://electronics.stackexchange.com/questions/560889/understanding-how-tft-driver-operates-ili9486](https://electronics.stackexchange.com/questions/560889/understanding-how-tft-driver-operates-ili9486)  
33. Inverted Color \+ glitch ILI9486 / ILI9481 · Issue \#25 · prenticedavid/MCUFRIEND\_kbv, 访问时间为 二月 13, 2026， [https://github.com/prenticedavid/MCUFRIEND\_kbv/issues/25](https://github.com/prenticedavid/MCUFRIEND_kbv/issues/25)  
34. Use DMA transaction in SPI device driver \- NXP Community, 访问时间为 二月 13, 2026， [https://community.nxp.com/t5/i-MX-Processors/Use-DMA-transaction-in-SPI-device-driver/td-p/2010163](https://community.nxp.com/t5/i-MX-Processors/Use-DMA-transaction-in-SPI-device-driver/td-p/2010163)  
35. Pisound on the Orange Pi 5 plus \- Tutorials \- Blokas Community, 访问时间为 二月 13, 2026， [https://community.blokas.io/t/pisound-on-the-orange-pi-5-plus/5949](https://community.blokas.io/t/pisound-on-the-orange-pi-5-plus/5949)  
36. Conflicting dtoverlays and framebuffer \- Raspberry Pi Stack Exchange, 访问时间为 二月 13, 2026， [https://raspberrypi.stackexchange.com/questions/79021/conflicting-dtoverlays-and-framebuffer](https://raspberrypi.stackexchange.com/questions/79021/conflicting-dtoverlays-and-framebuffer)  
37. The Framebuffer Console \- The Linux Kernel documentation, 访问时间为 二月 13, 2026， [https://docs.kernel.org/fb/fbcon.html](https://docs.kernel.org/fb/fbcon.html)  
38. Framebuffer (Linux) \- Toradex Developer Center, 访问时间为 二月 13, 2026， [https://developer.toradex.com/linux-bsp/application-development/multimedia/framebuffer-linux/](https://developer.toradex.com/linux-bsp/application-development/multimedia/framebuffer-linux/)  
39. Kernel Mode-setting \- FreeDesktop.Org, 访问时间为 二月 13, 2026， [https://people.freedesktop.org/\~mslusarz/nouveau-wiki-dump/KernelModeSetting.html](https://people.freedesktop.org/~mslusarz/nouveau-wiki-dump/KernelModeSetting.html)  
40. Orange Pi 5 SPI (spidev) connection problem. \- Interfacing \- OrangePi \- mobile \- Powered by Discuz\!, 访问时间为 二月 13, 2026， [http://www.orangepi.org/orangepibbsen/forum.php?mod=viewthread\&tid=145421](http://www.orangepi.org/orangepibbsen/forum.php?mod=viewthread&tid=145421)  
41. 3.5 LCD ILI9486 with orange pi zero \- Beginners \- Armbian Community Forums, 访问时间为 二月 13, 2026， [https://forum.armbian.com/topic/11701-35-lcd-ili9486-with-orange-pi-zero/](https://forum.armbian.com/topic/11701-35-lcd-ili9486-with-orange-pi-zero/)  
42. ILI9486 LCD driver init question : r/embedded \- Reddit, 访问时间为 二月 13, 2026， [https://www.reddit.com/r/embedded/comments/121spr5/ili9486\_lcd\_driver\_init\_question/](https://www.reddit.com/r/embedded/comments/121spr5/ili9486_lcd_driver_init_question/)  
43. Orange Pi 5 Bricked? \- Beginners \- Armbian Community Forums, 访问时间为 二月 13, 2026， [https://forum.armbian.com/topic/49922-orange-pi-5-bricked/](https://forum.armbian.com/topic/49922-orange-pi-5-bricked/)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAVCAYAAACt4nWrAAAA1klEQVR4AeySOwrCQBRF4x9cjbgYQRQEV2EtLsVWsBDcgOAftLHRDVhbqzm3CIQweZMU6Sbck5c3ybshd1KPKjyCuTPcEEvpWDpMNCArrbWzi67eyrzPwABqkEimc5oeeGWZn5j+wBT0FU3qGNagexRblvmX0Q08YQQLeMAZCskyTwwuXCiGFvUOheUzVxQz3JawgiGk94A2X5Z5l7EJbEEZ76lvUETaAy5tWeb6W66My5QS/TnpRS+qYqLYssx3jN4grR/NAY7glWXuHfY9EMydCVUaSwwAAP//wlWETQAAAAZJREFUAwD46hsrVE8yigAAAABJRU5ErkJggg==>
