#!/usr/bin/env bash
# 拉取 ovaltine 固件分区镜像（radio/），因为 modem.img 270.8 MiB 超过 GitHub 100 MiB 硬限，
# 这 24 个镜像放在 Release 附件里，不进 git 历史。
set -euo pipefail

ORG="MagicNeko-ROM"
REPO="proprietary_vendor_oneplus_ovaltine"
TAG="${OVALTINE_FW_TAG:-firmware-CPH2415_15.0.0.700}"
ASSET="ovaltine-radio-CPH2415_15.0.0.700.tar.zst"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$REPO_ROOT/radio"
URL="https://github.com/${ORG}/${REPO}/releases/download/${TAG}/${ASSET}"

cd "$REPO_ROOT"
mkdir -p "$DEST"

echo "==> 下载 $ASSET (${TAG})"
curl -L --fail --retry 3 -o "$ASSET" "$URL"

echo "==> 解压到 radio/"
tar --zstd -xf "$ASSET" -C "$DEST"

echo "==> 校验 sha256"
( cd "$DEST" && sha256sum -c SHA256SUMS )

n=$(find "$DEST" -maxdepth 1 -type f -name '*.img' | wc -l)
echo "==> 完成：radio/ 下 $n 个 .img（应为 24）"
[ "$n" -eq 24 ] || { echo "警告：数量不是 24，检查附件是否完整" >&2; exit 1; }
echo "==> 可以删掉本地压缩包：rm -f $ASSET"
