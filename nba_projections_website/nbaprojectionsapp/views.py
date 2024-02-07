from django.shortcuts import render, HttpResponse
import requests
import json
# Create your views here.
def home(request):
    if request.method == 'POST':
        oefg= request.POST['OEFG']
        oftr= request.POST['OFTR']
        ooreb= request.POST['OREB']
        pace=request.POST["PACE"]
        minutes = request.POST['minutes']
        load = {'OEFG': oefg, 'OFTR': oftr, 'OREB': ooreb,'PACE':pace, 'MIN': minutes}
        json_load = json.dumps(load)
        response = requests.post("http://127.0.0.1:5000/points-prediction", json=json_load)
        print(request.POST)
        print(load)
        print(response)
    return render(request,"home.html")
