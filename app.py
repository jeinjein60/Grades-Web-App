from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///grades.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class StudentGrade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    grade = db.Column(db.Float, nullable=False)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('grades.html')

@app.route('/grades', methods=['GET'])
def get_grades():
    students = StudentGrade.query.all()
    return jsonify({student.name: student.grade for student in students})

@app.route('/grades/<name>', methods=['GET'])
def get_grade(name):
    student = StudentGrade.query.filter_by(name=name).first()
    if student:
        return jsonify({student.name: student.grade})
    return jsonify({"error": "Grade not found"}), 404


@app.route('/grades', methods=['POST'])
def add_grade():
    data = request.json
    if "name" not in data or "grade" not in data:
        return jsonify({"error": "Missing name or grade"}), 400

    if StudentGrade.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Student already exists"}), 400

    new_student = StudentGrade(name=data["name"], grade=data["grade"])
    db.session.add(new_student)
    db.session.commit()
    return jsonify({new_student.name: new_student.grade}), 201


@app.route('/grades/<name>', methods=['PUT'])
def update_grade(name):
    student = StudentGrade.query.filter_by(name=name).first()
    if not student:
        return jsonify({"error": "Grade not found"}), 404

    data = request.json
    if "grade" in data:
        student.grade = data["grade"]
        db.session.commit()
        return jsonify({student.name: student.grade})

    return jsonify({"error": "No grade provided"}), 400


@app.route('/grades/<name>', methods=['DELETE'])
def delete_grade(name):
    student = StudentGrade.query.filter_by(name=name).first()
    if not student:
        return jsonify({"error": "Grade not found"}), 404

    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": f"Grade for {name} deleted."})

if __name__ == '__main__':
    app.run(debug=True)

