from flask import Flask, render_template, url_for, request, session, redirect
from flask.ext.pymongo import Pymongo
import bycrypt

app = Flask(_name_)

