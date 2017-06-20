# coding: utf-8

require 'rubygems'
require 'bundler'

Bundler.require( :default, ENV['RACK_ENV'].to_sym ) # require tout les gems définis dans Gemfile

require 'tilt/erb'

require_relative './config/init'
require_relative './routes/index'
require_relative './routes/stats'

# Application Sinatra servant de base
class SinatraApp < Sinatra::Base
  configure :production, :development do
    set :protection, true
    set :protection, except: :frame_options
    set :show_exceptions, false
  end

  register Portail::Routes::Index

  register Portail::Routes::Stats
end
