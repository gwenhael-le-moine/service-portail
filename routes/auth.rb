# -*- coding: utf-8 -*-

module Portail
  module Routes
    module Auth
      def self.registered( app )
        app.get '/auth/cas/callback' do
          env['rack.session'][:authenticated] = true

          protocol = CASAUTH::CONFIG[:ssl] ? 'https' : 'http'
          redirect params[:url] if params[:url] != "#{protocol}://#{env['HTTP_HOST']}#{APP_PATH}/"
          redirect "#{protocol}://#{env['HTTP_HOST']}#{APP_PATH}/"
        end

        app.get '/auth/failure' do
          erb :auth_failure
        end

        app.get '/auth/cas/deauthorized' do
          erb :auth_deauthorized
        end

        app.get '/protected' do
          throw( :halt, [ 401, "Not authorized\n" ] ) unless env['rack.session'][:authenticated]
          erb :auth_protected
        end

        app.get '/login' do
          redirect "#{APP_PATH}/auth/cas/?url=#{URL_ENT}#{APP_PATH}/"
        end

        app.get '/logout' do
          env['rack.session'][:authenticated] = false
          session.clear

          redirect URL_ENT
        end
      end
    end
  end
end
