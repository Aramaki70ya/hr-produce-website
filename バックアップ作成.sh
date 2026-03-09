#!/bin/bash

# プロジェクトをZIP圧縮するスクリプト

# 現在のディレクトリを取得
PROJECT_DIR="/Users/aramakinaoya/Downloads/ホームページ制作"
cd "$PROJECT_DIR"

# 日付を取得
DATE=$(date +%Y%m%d)

# ZIPファイル名
ZIP_NAME="ホームページ制作_バックアップ_${DATE}.zip"

# プロジェクトフォルダの親ディレクトリにZIPを作成
cd ..
zip -r "$ZIP_NAME" "ホームページ制作"

echo "✅ ZIPファイルを作成しました: $ZIP_NAME"
echo "📁 場所: $(pwd)/$ZIP_NAME"
