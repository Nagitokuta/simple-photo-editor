// DOM要素の取得
const photoInput = document.getElementById('photoInput');
const uploadButton = document.getElementById('uploadButton');
const photoCanvas = document.getElementById('photoCanvas');
const ctx = photoCanvas.getContext('2d');

// 現在の画像データを保持する変数
let currentImageData = null;
let originalImage = null;

// 画面切り替え関数
function showScreen(screenId) {
  document.getElementById('uploadScreen').style.display = 'none';
  document.getElementById('editScreen').style.display = 'none';
  document.getElementById('completeScreen').style.display = 'none';
  document.getElementById(screenId).style.display = 'block';
}

// アスペクト比を保持してサイズを計算する関数
function calculateAspectRatio(originalWidth, originalHeight, maxWidth, maxHeight) {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // 最大幅を超える場合
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  // 最大高さを超える場合
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
}

// 画像をCanvasに描画する関数
function drawImageToCanvas(img) {
  // 元画像を保存
  originalImage = img;
  
  // Canvasのサイズを設定
  const maxWidth = 400;
  const maxHeight = 300;
  
  // 画像のアスペクト比を保持しながらサイズを調整
  let { width, height } = calculateAspectRatio(img.width, img.height, maxWidth, maxHeight);
  
  // Canvasのサイズを設定
  photoCanvas.width = width;
  photoCanvas.height = height;
  
  // Canvasをクリア
  ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
  
  // 画像を描画
  ctx.drawImage(img, 0, 0, width, height);
  
  // 現在の画像データを保存（フィルター処理用）
  currentImageData = ctx.getImageData(0, 0, photoCanvas.width, photoCanvas.height);
}

// ページ読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
  
  // アップロードボタンのクリックイベント
  uploadButton.addEventListener('click', function() {
    // ファイルが選択されているかチェック
    if (!photoInput.files || photoInput.files.length === 0) {
      alert('写真を選択してください。');
      return;
    }

    // ファイル情報を取得
    const file = photoInput.files[0];

    // 画像ファイルかどうかをチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('5MB以下の画像を選択してください。');
      return;
    }

    // FileReaderで画像データを読み込む
    const reader = new FileReader();

    reader.onload = function(e) {
      // 画像オブジェクトを作成
      const img = new Image();
      
      img.onload = function() {
        // 画像をCanvasに描画
        drawImageToCanvas(img);
        
        // 編集画面に遷移
        showScreen('editScreen');
      };
      
      // 画像のsrcに読み込んだデータをセット
      img.src = e.target.result;
    };

    // ファイルの内容をDataURL（画像として表示できる形式）で読み込む
    reader.readAsDataURL(file);
  });
  
  // 保存ボタンのクリックイベント
  document.getElementById('saveButton').addEventListener('click', function() {
    showScreen('completeScreen');
  });
  
  // もう一度編集するボタンのクリックイベント
  document.getElementById('editAgainButton').addEventListener('click', function() {
    showScreen('editScreen');
  });
  
  // トップに戻るボタンのクリックイベント
  document.getElementById('backToTopButton').addEventListener('click', function() {
    showScreen('uploadScreen');
  });
  
  // 写真を変更ボタンのクリックイベント
  document.getElementById('changePhotoButton').addEventListener('click', function() {
    showScreen('uploadScreen');
  });
  
});

// 既存のapp.jsに以下の機能を追加

// 回転角度を保持する変数
let currentRotation = 0;

// トリミング用の変数
let isCropping = false;
let cropStartX = 0;
let cropStartY = 0;
let cropEndX = 0;
let cropEndY = 0;
let cropSelection = null;

// ページ読み込み完了後に編集機能のイベントリスナーを追加
document.addEventListener('DOMContentLoaded', function() {
  // 既存のコード...
  
  // 回転ボタンのイベントリスナー
  document.getElementById('rotateButton').addEventListener('click', function() {
    if (!originalImage) {
      alert('先に写真をアップロードしてください');
      return;
    }
    
    // 90度回転
    currentRotation += 90;
    if (currentRotation >= 360) {
      currentRotation = 0;
    }
    
    // 回転した画像を描画
    drawRotatedImage();
  });
  
  // サイズ変更ボタンのイベントリスナー
  document.getElementById('resizeButton').addEventListener('click', function() {
    if (!originalImage) {
      alert('先に写真をアップロードしてください');
      return;
    }
    
    // 現在のサイズを表示
    const currentWidth = photoCanvas.width;
    const currentHeight = photoCanvas.height;
    
    // 新しいサイズを入力してもらう
    const newWidth = prompt(`新しい幅を入力してください（現在: ${currentWidth}px）`, currentWidth);
    if (!newWidth || isNaN(newWidth) || newWidth <= 0) {
      alert('正しい数値を入力してください');
      return;
    }
    
    const newHeight = prompt(`新しい高さを入力してください（現在: ${currentHeight}px）`, currentHeight);
    if (!newHeight || isNaN(newHeight) || newHeight <= 0) {
      alert('正しい数値を入力してください');
      return;
    }
    
    // サイズ変更を実行
    resizeImage(parseInt(newWidth), parseInt(newHeight));
  });
  
  // トリミングボタンのイベントリスナー
  document.getElementById('cropButton').addEventListener('click', function() {
    if (!originalImage) {
      alert('先に写真をアップロードしてください');
      return;
    }
    
    // トリミングモードを開始
    startCropMode();
  });
});
// ページ読み込み完了後にフィルター機能のイベントリスナーを追加
document.addEventListener('DOMContentLoaded', function() {
  // 既存のコード...
  
  // フィルターボタンのイベントリスナー
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (!originalImage) {
        alert('先に写真をアップロードしてください');
        return;
      }
      
      // 現在選択されているフィルターボタンのスタイルをリセット
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // クリックされたボタンをアクティブにする
      this.classList.add('active');
      
      // フィルターを適用
      const filterType = this.getAttribute('data-filter');
      applyFilter(filterType);
    });
  });
});
// ページ読み込み完了後に保存機能のイベントリスナーを追加
document.addEventListener('DOMContentLoaded', function() {
  // 既存のコード...
  
  // 保存ボタンのクリックイベント
  document.getElementById('saveButton').addEventListener('click', function() {
    if (!originalImage) {
      alert('保存する画像がありません');
      return;
    }
    
    // 保存処理を実行
    saveEditedPhoto();
  });
});

// 編集した写真を保存する関数
function saveEditedPhoto() {
  try {
    // Canvasから画像データ（DataURL）を取得
    const dataURL = photoCanvas.toDataURL('image/png');
    
    // Local Storageに保存
    saveToLocalStorage(dataURL);
    
    // デバイスにダウンロード
    downloadImage(dataURL);
    
    // 保存完了画面へ遷移
    showScreen('completeScreen');
    
  } catch (error) {
    console.error('保存エラー:', error);
    alert('保存に失敗しました。もう一度お試しください。');
  }
}

// Local Storageに画像データを保存する関数
function saveToLocalStorage(dataURL) {
  try {
    // 保存する画像データの情報
    const imageInfo = {
      dataURL: dataURL,
      timestamp: new Date().toISOString(),
      filename: `edited_photo_${Date.now()}.png`
    };
    
    // Local Storageに保存
    localStorage.setItem('lastEditedPhoto', JSON.stringify(imageInfo));
    
    // 保存履歴も管理（最大5件まで）
    saveToHistory(imageInfo);
    
    console.log('Local Storageに保存しました');
    
  } catch (error) {
    console.error('Local Storage保存エラー:', error);
    // Local Storageの容量制限に達した場合の処理
    if (error.name === 'QuotaExceededError') {
      alert('ブラウザの保存容量が不足しています。古いデータを削除してください。');
    }
  }
}

// 保存履歴を管理する関数
function saveToHistory(imageInfo) {
  try {
    // 既存の履歴を取得
    let history = JSON.parse(localStorage.getItem('photoEditHistory') || '[]');
    
    // 新しい画像情報を先頭に追加
    history.unshift(imageInfo);
    
    // 最大5件まで保持
    if (history.length > 5) {
      history = history.slice(0, 5);
    }
    
    // 履歴を保存
    localStorage.setItem('photoEditHistory', JSON.stringify(history));
    
  } catch (error) {
    console.error('履歴保存エラー:', error);
  }
}

// 画像をデバイスにダウンロードする関数
function downloadImage(dataURL) {
  try {
    // ダウンロード用のリンク要素を作成
    const link = document.createElement('a');
    
    // ファイル名を生成（現在の日時を含む）
    const now = new Date();
    const filename = `edited_photo_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.png`;
    
    // リンクの設定
    link.href = dataURL;
    link.download = filename;
    link.style.display = 'none';
    
    // DOMに追加してクリック、その後削除
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('画像をダウンロードしました:', filename);
    
  } catch (error) {
    console.error('ダウンロードエラー:', error);
    alert('ダウンロードに失敗しました。');
  }
}

// Local Storageから最後に保存した画像を読み込む関数
function loadLastEditedPhoto() {
  try {
    const savedData = localStorage.getItem('lastEditedPhoto');
    if (!savedData) {
      console.log('保存された画像がありません');
      return null;
    }
    
    const imageInfo = JSON.parse(savedData);
    return imageInfo;
    
  } catch (error) {
    console.error('読み込みエラー:', error);
    return null;
  }
}

// 保存履歴を取得する関数
function getPhotoEditHistory() {
  try {
    const history = localStorage.getItem('photoEditHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('履歴取得エラー:', error);
    return [];
  }
}

// Local Storageのデータを削除する関数
function clearLocalStorageData() {
  try {
    localStorage.removeItem('lastEditedPhoto');
    localStorage.removeItem('photoEditHistory');
    console.log('Local Storageのデータを削除しました');
  } catch (error) {
    console.error('削除エラー:', error);
  }
}

// フィルターを適用する関数
function applyFilter(filterType) {
  // 元の画像データを復元
  if (currentImageData) {
    ctx.putImageData(currentImageData, 0, 0);
  } else {
    // currentImageDataがない場合は元画像から再描画
    ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
    ctx.drawImage(originalImage, 0, 0, photoCanvas.width, photoCanvas.height);
  }
  
  // 現在の画像データを取得
  let imageData = ctx.getImageData(0, 0, photoCanvas.width, photoCanvas.height);
  
  // フィルタータイプに応じて処理を分岐
  switch (filterType) {
    case 'normal':
      // ノーマル（何もしない）
      break;
    case 'monochrome':
      imageData = applyMonochromeFilter(imageData);
      break;
    case 'sepia':
      imageData = applySepiaFilter(imageData);
      break;
    case 'vintage':
      imageData = applyVintageFilter(imageData);
      break;
    default:
      console.log('Unknown filter type:', filterType);
      return;
  }
  
  // フィルター適用後の画像をCanvasに描画
  ctx.putImageData(imageData, 0, 0);
}

// モノクロフィルターを適用する関数
function applyMonochromeFilter(imageData) {
  const data = imageData.data;
  
  // 各ピクセルを処理
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];     // 赤
    const g = data[i + 1]; // 緑
    const b = data[i + 2]; // 青
    
    // グレースケール値を計算（加重平均を使用）
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    // RGB全てに同じ値を設定
    data[i] = gray;     // 赤
    data[i + 1] = gray; // 緑
    data[i + 2] = gray; // 青
  }
  
  return imageData;
}

// セピアフィルターを適用する関数
function applySepiaFilter(imageData) {
  const data = imageData.data;
  
  // 各ピクセルを処理
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];     // 赤
    const g = data[i + 1]; // 緑
    const b = data[i + 2]; // 青
    
    // セピア色変換の計算式
    const newR = Math.min(255, Math.round(0.393 * r + 0.769 * g + 0.189 * b));
    const newG = Math.min(255, Math.round(0.349 * r + 0.686 * g + 0.168 * b));
    const newB = Math.min(255, Math.round(0.272 * r + 0.534 * g + 0.131 * b));
    
    // 新しい色値を設定
    data[i] = newR;     // 赤
    data[i + 1] = newG; // 緑
    data[i + 2] = newB; // 青
  }
  
  return imageData;
}

// ビンテージフィルターを適用する関数
function applyVintageFilter(imageData) {
  const data = imageData.data;
  
  // 各ピクセルを処理
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];     // 赤
    let g = data[i + 1]; // 緑
    let b = data[i + 2]; // 青
    
    // コントラストを下げる
    r = r * 0.9 + 20;
    g = g * 0.85 + 15;
    b = b * 0.8 + 10;
    
    // ちょっぴり黄色みを足してビンテージ感
    r = Math.min(255, r + 10);
    g = Math.min(255, g + 10);
    b = Math.min(255, b);
    
    // 新しい色値を設定
    data[i] = Math.round(r);     // 赤
    data[i + 1] = Math.round(g); // 緑
    data[i + 2] = Math.round(b); // 青
  }
  
  return imageData;
}

// 回転した画像をCanvasに描画する関数
function drawRotatedImage() {
  // Canvasをクリア
  ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
  
  // 回転の中心点を設定
  const centerX = photoCanvas.width / 2;
  const centerY = photoCanvas.height / 2;
  
  // Canvasの状態を保存
  ctx.save();
  
  // 中心点に移動
  ctx.translate(centerX, centerY);
  
  // 回転
  ctx.rotate((currentRotation * Math.PI) / 180);
  
  // 画像を描画（中心点を基準にするため、座標を調整）
  ctx.drawImage(originalImage, -photoCanvas.width / 2, -photoCanvas.height / 2, photoCanvas.width, photoCanvas.height);
  
  // Canvasの状態を復元
  ctx.restore();
  
  // 現在の画像データを更新
  currentImageData = ctx.getImageData(0, 0, photoCanvas.width, photoCanvas.height);
}

// 画像をリサイズする関数
function resizeImage(newWidth, newHeight) {
  // Canvasのサイズを変更
  photoCanvas.width = newWidth;
  photoCanvas.height = newHeight;
  
  // Canvasをクリア
  ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
  
  // リサイズした画像を描画
  if (currentRotation === 0) {
    // 回転していない場合
    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
  } else {
    // 回転している場合は回転を適用
    drawRotatedImage();
  }
  
  // 現在の画像データを更新
  currentImageData = ctx.getImageData(0, 0, photoCanvas.width, photoCanvas.height);
}// エラーメッセージを表示する関数
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    // 5秒後に自動で非表示にする
    setTimeout(() => {
      hideError(elementId);
    }, 5000);
  }
}

// エラーメッセージを非表示にする関数
function hideError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.classList.remove('show');
    errorElement.textContent = '';
  }
}

// すべてのエラーメッセージを非表示にする関数
function hideAllErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(element => {
    element.classList.remove('show');
    element.textContent = '';
  });
}

// 画面切り替え関数（改良版）
function showScreen(screenId) {
  // すべての画面を非表示にする
  const screens = ['uploadScreen', 'editScreen', 'completeScreen'];
  screens.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  });

  // 指定した画面だけ表示する
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.style.display = 'block';
  } else {
    console.error(`画面が見つかりません: ${screenId}`);
  }
  
  // 画面切り替え時にエラーメッセージをクリア
  hideAllErrors();
}

// Canvasが有効かどうかをチェックする関数
function isCanvasValid() {
  try {
    // Canvasが存在し、サイズが有効かチェック
    if (!photoCanvas || photoCanvas.width === 0 || photoCanvas.height === 0) {
      return false;
    }
    
    // 画像データが取得できるかチェック
    const imageData = ctx.getImageData(0, 0, photoCanvas.width, photoCanvas.height);
    return imageData && imageData.data.length > 0;
  } catch (error) {
    console.error('Canvas検証エラー:', error);
    return false;
  }
}

// アプリをリセットする関数
function resetApp() {
  // 画像データをクリア
  originalImage = null;
  currentImageData = null;
  currentRotation = 0;
  
  // Canvasをクリア
  if (photoCanvas && ctx) {
    ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
  }
  
  // ファイル入力をクリア
  if (photoInput) {
    photoInput.value = '';
  }
  
  // エラーメッセージを非表示
  hideAllErrors();
  
  // フィルターボタンの選択状態をリセット
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => btn.classList.remove('active'));
}

// ページ読み込み完了後にバリデーション機能を追加
document.addEventListener('DOMContentLoaded', function() {
  // 既存のコード...
  
  // ファイル選択時のリアルタイムバリデーション
  photoInput.addEventListener('change', function() {
    hideError('uploadError');
    
    if (this.files && this.files.length > 0) {
      const file = this.files[0];
      
      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        showError('uploadError', '画像ファイルを選択してください');
        this.value = ''; // ファイル選択をクリア
        return;
      }
      
      // ファイルサイズチェック
      if (file.size > 5 * 1024 * 1024) {
        showError('uploadError', '5MB以下の画像を選択してください');
        this.value = ''; // ファイル選択をクリア
        return;
      }
      
      // 正常な場合は成功メッセージを表示（オプション）
      console.log('有効な画像ファイルが選択されました:', file.name);
    }
  });
  
  // 写真変更時の確認ダイアログ
  document.getElementById('changePhotoButton').addEventListener('click', function() {
    if (originalImage) {
      const confirmed = confirm('編集中の画像が失われますが、よろしいですか？');
      if (!confirmed) {
        return;
      }
    }
    
    // 画面をリセットしてアップロード画面に戻る
    resetApp();
    showScreen('uploadScreen');
  });
});

// トリミングモードを開始する関数
function startCropMode() {
  isCropping = true;
  photoCanvas.style.cursor = 'crosshair';
  
  // 指示メッセージを表示
  alert('トリミングしたい範囲をマウスでドラッグして選択してください');
  
  // マウスイベントを追加
  photoCanvas.addEventListener('mousedown', onCropMouseDown);
  photoCanvas.addEventListener('mousemove', onCropMouseMove);
  photoCanvas.addEventListener('mouseup', onCropMouseUp);
}

// マウスダウンイベント
function onCropMouseDown(e) {
  if (!isCropping) return;
  
  const rect = photoCanvas.getBoundingClientRect();
  cropStartX = e.clientX - rect.left;
  cropStartY = e.clientY - rect.top;
  cropSelection = { startX: cropStartX, startY: cropStartY };
}

// マウス移動イベント
function onCropMouseMove(e) {
  if (!isCropping || !cropSelection) return;
  
  const rect = photoCanvas.getBoundingClientRect();
  cropEndX = e.clientX - rect.left;
  cropEndY = e.clientY - rect.top;
  
  // 選択範囲を描画
  drawCropSelection();
}

// マウスアップイベント
function onCropMouseUp(e) {
  if (!isCropping || !cropSelection) return;
  
  const rect = photoCanvas.getBoundingClientRect();
  cropEndX = e.clientX - rect.left;
  cropEndY = e.clientY - rect.top;
  
  // トリミングを実行
  executeCrop();
  
  // トリミングモードを終了
  endCropMode();
}

// 選択範囲を描画する関数
function drawCropSelection() {
  // 元の画像を再描画
  redrawCurrentImage();
  
  // 選択範囲の矩形を描画
  ctx.save();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  const width = cropEndX - cropStartX;
  const height = cropEndY - cropStartY;
  ctx.strokeRect(cropStartX, cropStartY, width, height);
  
  ctx.restore();
}

// トリミングを実行する関数
function executeCrop() {
  const cropX = Math.min(cropStartX, cropEndX);
  const cropY = Math.min(cropStartY, cropEndY);
  const cropWidth = Math.abs(cropEndX - cropStartX);
  const cropHeight = Math.abs(cropEndY - cropStartY);
  
  // 選択範囲が小さすぎる場合はキャンセル
  if (cropWidth < 10 || cropHeight < 10) {
    alert('選択範囲が小さすぎます');
    redrawCurrentImage();
    return;
  }
  
  // 選択範囲の画像データを取得
  const croppedImageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
  
  // Canvasのサイズを変更
  photoCanvas.width = cropWidth;
  photoCanvas.height = cropHeight;
  
  // トリミングした画像を描画
  ctx.putImageData(croppedImageData, 0, 0);
  
  // 現在の画像データを更新
  currentImageData = ctx.getImageData(0, 0, photoCanvas.width, photoCanvas.height);
}

// トリミングモードを終了する関数
function endCropMode() {
  isCropping = false;
  cropSelection = null;
  photoCanvas.style.cursor = 'default';
  
  // マウスイベントを削除
  photoCanvas.removeEventListener('mousedown', onCropMouseDown);
  photoCanvas.removeEventListener('mousemove', onCropMouseMove);
  photoCanvas.removeEventListener('mouseup', onCropMouseUp);
}

// 現在の画像を再描画する関数
function redrawCurrentImage() {
  if (currentImageData) {
    ctx.putImageData(currentImageData, 0, 0);
  }
}