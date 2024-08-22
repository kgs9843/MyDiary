const mongoose = require('mongoose');

// Mongoose 스키마 및 모델 설정 예제
const DiarySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    weather: { type: String },
    title: { type: String },
    canvas: { type: String },
    content: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Diary', DiarySchema);