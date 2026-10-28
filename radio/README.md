# ovaltine 固件分区镜像（radio）—— 不随仓库分发

本目录需要的 **24 个固件镜像**（`abl.img`、`modem.img`、`tz.img`、`xbl.img` 等）
**不在本仓库的 git 历史中**。

原因很直接：`modem.img` 单文件 **270.8 MiB**，超过 GitHub 的单文件 100 MiB 硬限，
带着它推送会被 GitHub 直接拒收。因此固件改为 **GitHub Release 附件**单独分发。

## 获取方式

### 方式一：脚本（推荐）

```bash
./tools/fetch-firmware.sh
```

脚本会下载附件、校验 sha256、解压到本目录。

### 方式二：手动

```bash
TAG=firmware-CPH2415_15.0.0.700
ASSET=ovaltine-radio-CPH2415_15.0.0.700.tar.zst
URL=https://github.com/MagicNeko-ROM/proprietary_vendor_oneplus_ovaltine/releases/download/$TAG/$ASSET

curl -L --fail -O "$URL"
tar --zstd -xf "$ASSET" -C radio/
cd radio && sha256sum -c SHA256SUMS
```

解压后本目录应有 **24 个 `.img`** 加一个 `SHA256SUMS`。

## 文件清单（24 个分区）

```
abl.img        aop.img         aop_config.img   bluetooth.img
cpucp.img      devcfg.img      dsp.img          engineering_cdt.img
featenabler.img  hyp.img        imagefv.img      keymaster.img
modem.img      oplus_sec.img   oplusstanvbk.img qupfw.img
shrm.img       splash.img      tz.img           uefi.img
uefisecapp.img xbl.img         xbl_config.img   xbl_ramdump.img
```

逐个镜像的 sha256 见 `SHA256SUMS`（随附件一起提供，解压后出现）。

## 来源与用途

- 来源固件：**CPH2415_15.0.0.700(EX01)**（OnePlus 10T / ovaltine 官方 OTA 提取）
- 用途：`device/oneplus/sm8450-common` 的 `BOARD_PACK_RADIOIMAGES`
  与 `add-radio-file-sha1-checked` 会读取本目录镜像，打进 target_files 与 OTA 包
- **缺失时**：编译本身能过，但产出的 OTA **不含固件分区**，刷机后基带/引导链不更新

## 注意

- `radio/*` 已在 `.gitignore` 中，解压出来的镜像**不会被误提交**
- 不要在未校验的情况下刷写 `xbl`/`abl`/`tz` 等引导链分区：ARB 熔断是不可逆的
