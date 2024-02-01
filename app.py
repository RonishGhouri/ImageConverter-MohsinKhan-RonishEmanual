import shutil
import tempfile
import time
import uuid
import zipfile
from click import Path
from flask import Flask, jsonify, render_template, request, send_file
from PIL import Image
from io import BytesIO
from flask_pymongo import PyMongo
from pdf2docx import Converter
from docx2pdf import convert
import os
import pythoncom
import boto3
from botocore.exceptions import NoCredentialsError
from flask_cors import CORS
from pdf2image import convert_from_path
from werkzeug.security import generate_password_hash, check_password_hash
from docx2pdf import convert as docx_to_pdf
from werkzeug.utils import secure_filename
import aspose.words as aw
import io

app = Flask(__name__)

CORS(app)

AWS_ACCESS_KEY = 'AKIA5U644XGRII33VRG5'
AWS_SECRET_KEY = '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'
AWS_REGION = 'us-east-1'
S3_BUCKET_NAME = 'uploadedfilexhash'


s3_client = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY, region_name=AWS_REGION)

app.config['MONGO_URI'] = 'mongodb+srv://hashimali1074:hashimali1074@cluster0.iaegcxd.mongodb.net/py_project?retryWrites=true&w=majority'  # Update with your MongoDB URI
mongo = PyMongo(app)

@app.route('/register', methods=['POST'])
async def register():
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
async def login():
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

@app.route('/upload_file', methods=['POST'])
def upload_file():
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part"})
        
        file = request.files['file']

        # If the user does not select a file, the browser submits an empty file without a filename
        if file.filename == '':
            return jsonify({"error": "No selected file"})

        # Upload the file to the S3 bucket
        s3_client.upload_fileobj(file, S3_BUCKET_NAME, 'upload/' + file.filename)

        # s3_client.upload_fileobj(file, S3_BUCKET_NAME, file.filename)

        return jsonify({"message": "File uploaded successfully"})
    except NoCredentialsError:
        return jsonify({"error": "AWS credentials not available"}) 
    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route('/convertedd_file', methods=['POST'])
def upload_file1():
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part"})
        
        file = request.files['file']

        # If the user does not select a file, the browser submits an empty file without a filename
        if file.filename == '':
            return jsonify({"error": "No selected file"})

        # Upload the file to the S3 bucket
        unique_filename = f"{uuid.uuid4().hex}_{int(time.time())}_{secure_filename(file.filename)}"

        # Upload the file to the S3 bucket with the unique filename
        s3_client.upload_fileobj(file, S3_BUCKET_NAME, 'converted/' + unique_filename)


        # s3_client.upload_fileobj(file, S3_BUCKET_NAME, file.filename)

        return jsonify({"message": "File uploaded successfully"})
    except NoCredentialsError:
        return jsonify({"error": "AWS credentials not available"}) 
    except Exception as e:
        return jsonify({"error": str(e)})


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert/png2jpg', methods=['POST'])
def png_to_jpg():
    return convert_image('JPEG', jpeg_quality=85)

@app.route('/convert/jpg2png', methods=['POST'])
def jpg_to_png():
    return convert_image('PNG')

@app.route('/convert/png2jpeg', methods=['POST'])
def png_to_jpeg():
    return convert_image('JPEG', jpeg_quality=85)

@app.route('/convert/jpeg2png', methods=['POST'])
def jpeg_to_png():
    return convert_image('PNG')

@app.route('/convert/webp2jpg', methods=['POST'])
def webp_to_jpg():
    return convert_image('JPEG', jpeg_quality=85)


   
def convert_pdf_to_docx(input_pdf_path, output_docx_path):
    obj = Converter(input_pdf_path)
    obj.convert(output_docx_path)
    obj.close()
# here it is
@app.route('/convert/pdf2word', methods=['POST'])
def convert_endpoint():
    try:
        # Check if the request contains a file
        if 'file' not in request.files:
            return "No file part", 400

        file = request.files['file']

       
        # Check if the file has a valid PDF extension
        if file.filename == '' or not file.filename.endswith('.pdf'):
            return "Invalid file format. Please upload a PDF file.", 400
        
        # Create directories if they don't exist
        save_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(save_dir, exist_ok=True)

        # Save the uploaded PDF file
        pdf_path = os.path.join(save_dir, 'temp.pdf')
        file.save(pdf_path)

        # Extract original file name without extension
        original_filename = os.path.splitext(file.filename)[0]

        # Convert the PDF to DOCX
        docx_path = os.path.join(save_dir, f'{original_filename}.docx')
        convert_pdf_to_docx(pdf_path, docx_path)

     
        # Send the converted DOCX file as a response
        return send_file(docx_path, as_attachment=True)

    except Exception as e:
        return str(e), 500
    
    
def convert_docx_to_pdf(input_docx_path, output_pdf_path):
    pythoncom.CoInitialize()  # Initialize the COM environment
    convert(input_docx_path, output_pdf_path)

@app.route('/convert/word2pdf', methods=['POST'])
def convert_endpoint1():
    try:
        # Check if the request contains a file
        if 'file' not in request.files:
            return "No file part", 400
        
        file = request.files['file']


        # Check if the file has a valid DOCX extension
        if file.filename == '' or not file.filename.endswith('.docx'):
            return "Invalid file format. Please upload a DOCX file.", 400

        # Create directories if they don't exist
        save_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(save_dir, exist_ok=True)

        # Save the uploaded DOCX file
        docx_path = os.path.join(save_dir, 'temp.docx')
        file.save(docx_path)

        # Extract original file name without extension
        original_filename = os.path.splitext(file.filename)[0]

        # Convert the DOCX to PDF
        pdf_path = os.path.join(save_dir, f'{original_filename}.pdf')
        convert_docx_to_pdf(docx_path, pdf_path)

        # Send the converted PDF file as a response
        return send_file(pdf_path, as_attachment=True)

    except Exception as e:
        return str(e), 500

def convert_docx_to_images(input_docx_path, output_pdf_path):
    pythoncom.CoInitialize()  # Initialize the COM environment
    convert(input_docx_path, output_pdf_path)

@app.route('/convert/word2jpg', methods=['POST'])
def convert_word_to_images():
    try:
        # Check if the request contains a file
        if 'file' not in request.files:
            return "No file part", 400

        file = request.files['file']
      
        # Check if the file has a valid DOCX extension
        if file.filename == '' or not file.filename.endswith('.docx'):
            return "Invalid file format. Please upload a DOCX file.", 400

        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded DOCX file
            docx_path = os.path.join(temp_dir, 'temp.docx')
            file.save(docx_path)

            # Extract original file name without extension
            original_filename = os.path.splitext(file.filename)[0]

            # Convert the DOCX to PDF
            pdf_path = os.path.join(temp_dir, f'{original_filename}.pdf')
            convert_docx_to_images(docx_path, pdf_path)

            try:
                # Convert PDF to images
                pdf_images = convert_from_path(pdf_path, output_folder=temp_dir, fmt='jpg')
            except Exception as e:
            
                return 'Error converting PDF to images. Please check if the file is valid.', 500

            # Create a zip file containing all the images
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'a') as zip_file:
                for idx, image in enumerate(pdf_images):
                    image_path = os.path.join(temp_dir, f'page_{idx+1}.jpg')
                    image.save(image_path)
                    zip_file.write(image_path, os.path.basename(image_path))

            # Seek back to the beginning of the buffer
            zip_buffer.seek(0)

            # Return the zip file as a response
            return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='converted_images.zip')

    except Exception as e:
        return str(e), 500


@app.route('/convert/pdf2word1', methods=['POST'])
def convert_pdf_to_docx():
    try:
        # Get the uploaded PDF file
        pdf_file = request.files['file']
        
        # Set the output DOCX file path
        output_docx_path = "output.docx"
        
        # Convert FileStorage to bytes
        pdf_bytes = pdf_file.read()
        
        # Load the PDF document
        doc = aw.Document(io.BytesIO(pdf_bytes))
        
        # Save the document as DOCX
        doc.save(output_docx_path, aw.SaveFormat.DOCX)
        
        # Return the converted file with the correct MIME type
        return send_file(output_docx_path, as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    
    except Exception as e:
        return str(e)
   
@app.route('/convert/jpg2word', methods=['POST'])
def convert_image_to_docx():
    try:
        # Get the image file from the request
        image_file = request.files['file']

        # Create a new Aspose.Words document
        doc = aw.Document()
        builder = aw.DocumentBuilder(doc)

        # Read image file content into bytes
        image_bytes = image_file.read()

        # Insert the image into the document
        builder.insert_image(io.BytesIO(image_bytes))

        # Save the document to a temporary file
        output_file_path = "temp_output.docx"
        doc.save(output_file_path)

        # Return the generated document
        return send_file(output_file_path, as_attachment=True, download_name="Output.docx")

    except Exception as e:
        return f"Error: {str(e)}", 500 


def convert_image(format, jpeg_quality=None):
    uploaded_file = request.files['file']
   
    buffer = BytesIO(uploaded_file.read()) 

    if uploaded_file.filename != '':
        image = Image.open(uploaded_file)
       
        # Convert to 'RGB' mode if it's in 'P' mode
        if image.mode == 'P':
            image = image.convert('RGB')

        # Create a new image with a white background
        new_image = Image.new('RGB', image.size, 'white')

        # If the original image has an alpha channel, use it as the mask
        if 'A' in image.getbands():
            new_image.paste(image, (0, 0), image.split()[3])
        else:
            new_image.paste(image, (0, 0))

        buffer = BytesIO()

        # Save the new image in the specified format with optional quality settings
        save_kwargs = {}
        if format == 'JPEG':
            save_kwargs['quality'] = jpeg_quality if jpeg_quality else 85

        new_image.save(buffer, format=format, **save_kwargs)
 
        buffer.seek(0)
        
        original_filename = os.path.splitext(uploaded_file.filename)[0]

        download_name = f'{original_filename}.{format.lower()}'

        # Set the file extension based on the target format
        if format == 'JPEG':
            download_name += '.jpg'
        else:
            download_name += '.png'

        
        return send_file(buffer, download_name=download_name, as_attachment=True, mimetype=f'image/{format.lower()}')

    return "No file selected"


if __name__ == '__main__':
    app.run(debug=True)
