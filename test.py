from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash

from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")
app.config['MONGO_URI'] = 'mongodb+srv://hashimali1074:hashimali1074@cluster0.iaegcxd.mongodb.net/py_project?retryWrites=true&w=majority'  # Update with your MongoDB URI
mongo = PyMongo(app)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if email is already registered
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'message': 'Email already registered'}), 400

    # Hash the password before storing it
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    # Save the user information to the database
    user_data = {'email': email, 'password': hashed_password}
    mongo.db.users.insert_one(user_data)

    return jsonify({'message': 'Registration successful'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Retrieve user from the database
    user = mongo.db.users.find_one({'email': email})

    # Check if user exists and verify the password
    if user and check_password_hash(user['password'], password):
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

if __name__ == '__main__':
    app.run(debug=True)
