from flask import Flask, jsonify # import the flask class, an instance of this class is our testin app
from flask_cors import CORS

app = Flask(__name__) 
CORS(app)

@app.route("/") 
def index(): # the function that runs when the root URL, or "/" is visited
    return "base"

@app.route("/sup", methods=["GET"])
def sup():
    data = {
        "message" : "sup", 
        "status" : "success",
        "group" : "887D"
    }
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True) # server only starts when ran, not by an import

