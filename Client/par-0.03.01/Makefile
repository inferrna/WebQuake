#
#	$Id: Makefile.Linux,v 1.1 2004/08/05 22:52:59 solyga Exp $
#

CC=emcc
CFLAGS=-Wall -Wstrict-prototypes -fomit-frame-pointer -pipe -I$(HDDIR) -DOS_TYPE_Linux -DOS_TYPE_STR=\"Linux\" -Dprg_name=\"$(PRG)\" -DMANUAL_NUMBER=$(MAN_NO)
LDFLAGS=-Wl,-warn-common -s -L$(LIBDIR)

LDLIBS = 
HDDIR = ./
LIBDIR = ./

PRG = par
MAN_NO = 1

prefix = /usr/local
exec_prefix = ${prefix}
bindir = ${exec_prefix}/bin
sbindir = ${exec_prefix}/sbin
datadir = ${prefix}/share
mandir = ${prefix}/man

INSTALLDIR_BIN = ${bindir}
INSTALLDIR_MAN = ${mandir}/man$(MAN_NO)


all:		header.h $(PRG) $(PRG).$(MAN_NO)
		size $(PRG)
		touch $@

$(PRG).$(MAN_NO):	mkman
		./mkman > $@

mkman.c:	header.h mkmkman $(PRG).man
		cat $(PRG).man | ./mkmkman > $@

header.h:	$(PRG).h
		ln -s $(PRG).h $@

install:	all
		install -s -m 0755 -o root -g root $(PRG) $(INSTALLDIR_BIN)
		install    -m 0644 -o root -g root $(PRG).$(MAN_NO) $(INSTALLDIR_MAN)
		touch $@

clean:
		find . -name "*.o" -exec rm -f {} \;
		rm -f $(PRG) $(PRG).$(MAN_NO) header.h mkmkman mkman* all install

distclean:	clean
		rm -f Makefile
