# -*- coding: utf-8 -*-

require 'simple-rss'
require 'open-uri'

module Portail
  module Routes
    module Api
      module News
        def self.registered( app )
          #
          # Agrégateur RSS
          #
          app.get "#{APP_PATH}/api/news/?" do
            content_type :json, charset: 'utf-8'
            all_images_url_regexp = %r{/(https?:\/\/[a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i}
            only_image_url_regexp = %r{ /^https?:\/\/[a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif)$/i }

            news = []

            fluxes = Laclasse::CrossApp::Sender.send_request_signed( :service_annuaire_portail_flux, "/etablissement/#{user[:user_detailed]['profil_actif']['etablissement_code_uai']}", {} ) unless user[:user_detailed]['profil_actif'].nil?
            fluxes = config[:news_feed] if fluxes.nil? || fluxes.empty?

            # Add user news
            fluxes << { nb: 5,
                        icon: '',
                        flux: Laclasse::CrossApp::Sender.sign( :service_annuaire_portail_news, "/#{user[:uid]}", {} ),
                        title: 'News de l\'utilisateur',
                        type: 'publipostage' }

            fluxes.each do |feed|
              feed = Hash[ feed.map { |k, v| [k.to_sym, v] } ]
              begin
                news << SimpleRSS.parse( open( feed[:flux] ) )
                                 .items
                                 .sort_by(&:updated)
                                 .reverse
                                 .first( feed[:nb] )
                                 .map do |article|
                  if article.instance_variable_defined?( :@image )
                    image = article.image
                  elsif article.instance_variable_defined?( :@content ) && !article.content.nil? && article.content.content.match( only_image_url_regexp )
                    image = article.content
                  else
                    images = article.content.match( all_images_url_regexp ) unless article.content.nil?

                    if images.nil?
                      image = nil
                    else
                      image = images.first
                      article.content.sub!( all_images_url_regexp, '' )
                    end
                  end

                  { image: image,
                    link: URI.unescape( article.link.to_s.force_encoding( 'UTF-8' ).encode! ),
                    pubDate: article.updated,
                    title: URI.unescape( article.title.to_s.force_encoding( 'UTF-8' ).encode! ),
                    description: URI.unescape( article.content.to_s.force_encoding( 'UTF-8' ).encode! ),
                    type: feed.key?(:type) ? feed[:type] : 'unknown' }
                end
              rescue => e
                LOGGER.debug e.message
                LOGGER.error e.backtrace
                LOGGER.warn "impossible d'ouvrir #{feed[:flux]}"
              end
            end

            json news
                   .flatten
                   .uniq { |article| article[:description] }
          end
        end
      end
    end
  end
end
