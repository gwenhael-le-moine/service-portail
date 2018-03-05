require 'rubygems'
require 'bundler'

Bundler.require( :default, ENV['RACK_ENV'].to_sym ) # require tout les gems définis dans Gemfile

require 'tilt/erb'

require_relative './config/init'

# Application Sinatra servant de base
class SinatraApp < Sinatra::Base
  configure :production, :development do
    set :protection, true
    set :protection, except: :frame_options
    set :show_exceptions, false
  end

  before do
    expires 500, :public, :must_revalidate
  end

  get '/?' do
    erb :app
  end

  get '/stats/?' do
    erb :stats, layout: false
  end
end
