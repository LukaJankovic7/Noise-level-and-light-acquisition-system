from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import datetime
from flask_socketio import SocketIO, emit

# server setup
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

#MongoDB setup
client = MongoClient()
db = client.sensors
collection = db.sensors
collection.create_index("time", expireAfterSeconds = 86400) #expire after 1 day

#get time
time = datetime.datetime.utcnow()

#Variable initialization
lightToggleValue = ''
avg_light_data = []
avg_sound_data = []

# define function for average data
def get_avg_data(data):
    length = len(data)
    sound_sum = 0
    light_sum = 0
    try:
        data[0]['sound_data']
        try:
            data[0]['light_data']

            #average out data values
            for x in range(0,length):
                sound_sum += data[x]['sound_data']
                light_sum += data[x]['light_data']
            avg_sound = '%.2f'%(sound_sum/length)
            avg_light = '%.2f'%(light_sum/length)

            return [avg_sound, avg_light]
        
        except:
            for x in range(0,length):
                sound_sum += data[x]['sound_data']
            avg_sound = '%.2f'%(sound_sum/length)
            
            return avg_sound
    except:
        for x in range(0,length):
            light_sum += data[x]['light_data']
        avg_light = '%.2f'%(light_sum/length)

        return avg_light
    
#define request for light switch
@socketio.on('lightChange')
def handle(data):
    global lightToggleValue
    lightToggleValue = data['data']

#define main page request
@app.route('/')
def hello():
    return render_template('index.html')

# define request for data acquisition from DB
@app.route('/loadData')
def loadData():
    num = int(request.args['num'])
    chart = request.args['chart']

    db_data = []

    # get corresponding data
    if(chart=='sound'):
        db_data_cursor = collection.find({},{'_id':0, 'light_data':0}).sort('time', -1).limit(num*120)
    else:
        db_data_cursor = collection.find({},{'_id':0, 'sound_data':0}).sort('time', -1).limit(num*120)

    # sort and format data
    if(db_data_cursor.count()!=0):
        for element in db_data_cursor:
            db_data.append(element)

        db_data.reverse()

        db_sensor_data = []

        for x in range(0, int(len(db_data)/20)):
            temp = db_data[x*20:(x+1)*20]
            db_avg_data = (float(get_avg_data(temp)))

            db_sensor_data.append({
                'time' : db_data[(x+1)*20-1]['time'],
                'sensor_data': float('%.2f'%db_avg_data)
            })

        return jsonify(db_sensor_data)
    
    return {'data':'no_data'}


# define request for new data
@app.route('/data', methods = ['POST', 'GET'])
def data():

    if request.method == 'POST':
        global lightToggleValue

        content = request.get_json()
        if (content):
            global avg_light_data 

            light_data = content['light_data'].split('+', 4)
            light_data.pop()
            sound_data = content['sound_data'].split('+', 4)
            sound_data.pop()

            db_data = []


            for x in range(0, len(light_data)):
                light_data[x] = float(light_data[x])
                sound_data[x] = float(sound_data[x])

                temp = {
                    'time': (datetime.datetime.now()-datetime.timedelta(seconds=(2-x/2))).strftime("%H:%M:%S.%f")[:-3],
                    'sound_data': float('%.2f'%sound_data[x]),
                    'light_data': float('%.2f'%light_data[x])
                }
                db_data.append(temp)
            
            collection.insert_many(db_data)

            [avg_sound, avg_light] = get_avg_data(db_data)

            avg_sound_data.append(float(avg_sound))
            avg_light_data.append(float(avg_light))

            if(len(avg_light_data)==5):
                current_time = datetime.datetime.now()

                avg = sum(avg_sound_data)/5
                sound_data_obj ={
                        'time': current_time.strftime("%H:%M:%S"),
                        'data': float('%.2f' % avg)
                    }

                avg = sum(avg_light_data)/5
                light_data_obj = {
                        'time': current_time.strftime("%H:%M:%S"),
                        'data': float('%.2f' % avg)
                    }

                sensor_data = []
                sensor_data.append(sound_data_obj)                
                sensor_data.append(light_data_obj)

                emit('JS_get_data', sensor_data, namespace='/', broadcast=True)

                avg_sound_data.clear()
                avg_light_data.clear()

            return lightToggleValue
        
    return '000'


if __name__ == '__main__':
    socketio.run(app, host='192.168.0.14', port='5000', debug=True)