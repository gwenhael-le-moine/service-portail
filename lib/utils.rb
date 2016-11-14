# -*- coding: utf-8 -*-

module Portail
  module Utils
    module RSS
      module_function

      def date( article )
        return article.pubDate if article.respond_to?( :pubDate )
        return article.updated.content if article.respond_to?( :updated )

        Time.now
      end

      def rationalize( article )
        all_images_url_regexp = Regexp.new( 'https?:\\/\\/[a-z\\-_0-9\\/\\:\\.]*\\.(jpg|jpeg|png|gif)', Regexp::IGNORECASE )
        only_image_url_regexp = Regexp.new( '^https?:\/\/[a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif)$', Regexp::IGNORECASE )

        entry = { image: nil,
                  link: nil,
                  title: nil,
                  pubDate: date( article ),
                  content: nil }

        entry[:link] = article.link unless article.link.respond_to?( :href )
        entry[:link] = article.link.href if article.link.respond_to?( :href )

        entry[:title] = article.title unless article.title.respond_to?( :content )
        entry[:title] = article.title.content if article.title.respond_to?( :content )

        # entry[:content] = article.content_encoded if article.respond_to?( :content_encoded )
        entry[:content] = article.description if entry[:content].nil? && article.respond_to?( :description )
        entry[:content] = article.content.content if entry[:content].nil? && article.respond_to?( :content ) && !article.content.nil?
        entry[:content] = article.subtitle.content if entry[:content].nil? && article.respond_to?( :subtitle )
        entry[:content] = article.summary.content if entry[:content].nil? && article.respond_to?( :summary )

        entry[:image] = article.image if article.respond_to?( :image )
        entry[:image] = article.logo.content if entry[:image].nil? && article.respond_to?( :logo )
        entry[:image] = article.links.select { |l| !l.type.nil? }.first.href if entry[:image].nil? && article.respond_to?( :links )

        if entry[:image].nil? && article.respond_to?( :content_encoded ) && !article.content_encoded.nil?
          images = article.content_encoded.match( all_images_url_regexp )
          entry[:image] = images[0] unless images.nil?
        end

        entry
      end
    end
  end
end
