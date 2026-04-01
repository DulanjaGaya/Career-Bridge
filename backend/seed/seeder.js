import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Question from '../models/Question.js';
import Resource from '../models/Resource.js';
import { questions } from './questions.js';
import { resources } from './resources.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Question.deleteMany();
        await Resource.deleteMany();

        await Question.insertMany(questions);
        await Resource.insertMany(resources);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Question.deleteMany();
        await Resource.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
