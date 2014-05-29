/*
  par.c  --  Quake *.pak file archiver
  Copyright (C) 1998-2004 Steffen Solyga <solyga@absinth.net>

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
*/

/*
 *	$Id: par.c,v 1.3 2004/08/05 22:57:07 solyga Exp $
 */


#include	"par.h"
#ifdef html
#include "emscripten.h"
#endif

int
display_help( char* pn ) {
  fprintf( HELP_CHANNEL, "%s v%s (%s): ", pn, VERSION_NUMBER, DATE_OF_LAST_MOD );
  fprintf( HELP_CHANNEL, "Quake Pak ARchiving utility.\n" );
  fprintf( HELP_CHANNEL, "Flowers & bug reports to %s.\n", MY_EMAIL_ADDRESS );
  fprintf( HELP_CHANNEL, "Usage: %s options archive [files]\n", pn );
  fprintf( HELP_CHANNEL, "switches:\n" );
  fprintf( HELP_CHANNEL, "  -c\t create new pak archive\n" );
  fprintf( HELP_CHANNEL, "  -f\t force actions\n" );
  fprintf( HELP_CHANNEL, "  -h\t write this info to %s and exit sucessfully\n",HELP_CHANNEL==stdout?"stdout":"stderr" );
  fprintf( HELP_CHANNEL, "  -l\t list contents of pak archive\n" );
  fprintf( HELP_CHANNEL, "  -t\t files !!contain!! the names of the files to process\n" );
  fprintf( HELP_CHANNEL, "  -v\t be verbose\n" );
  fprintf( HELP_CHANNEL, "  -x\t extract files from archive\n" );
  fprintf( HELP_CHANNEL, "  -V\t print version and compilation info to %s and exit sucessfully\n", VERSION_CHANNEL==stdout?"stdout":"stderr" );
  fprintf( HELP_CHANNEL, "Hint: %s doesn't work with stdin/stdout.\n", pn );
  return( 0 );
}


int
display_version( char* pn ) {
  fprintf( VERSION_CHANNEL, "%s v%s (%s)\n", pn, VERSION_NUMBER, DATE_OF_LAST_MOD );
  return( 0 );
}


int	is_in_list(
		char*	list,
		char*	name )
/* returns index+1 of name in list or 0 if name is not in list */
/* if name is empty, number_of_entries+1 is returned */
{
  char *pl= list;
  char *pn;
  int index= 0;                 /* index in [0,noe) */
  while( *pl != '\0' )
  {
    for( pn=name; ; pl++,pn++ )
    {
      if( *pl != *pn ) break;
      if( *pl == '\0' ) return( index+1 );
    }
    while( *pl++ != '\0' );     /* next entry */
    index++;
  }
  return( *name=='\0' ? index+1 : 0 );
}


char*	add_to_list(
		char*	name )
{
  static long nba= 0;	/* number of bytes allocated */
  static char *p0=NULL;	/* memory start */
  static char *p1=NULL;	/* write position */
  char *p= name;	/* tmp pointer */
  int len= 1;		/* name length including '\0' */
  while( *p++ != '\0' ) len++;
  if( p1-p0+len >= nba )
  {
    unsigned long diff= p1-p0;
    nba+= MALLOC_SIZE;
    if( (p1=realloc(p0,nba)) == NULL ) return( realloc(p0,0) );
    p0= p1; p1+= diff;
    *p1= '\0';		/* init for first call */
#ifdef DEBUG
  fprintf( DEBUG_CHANNEL, "DEBUG: add_to_list(): Allocated %#08x for list.\n", p0 );
#endif
  }
  /* check name */
  if( is_in_list(p0,name) ) return( p0 );
  /* append name */
#ifdef DEBUG
  fprintf( DEBUG_CHANNEL, "DEBUG: add_to_list(): Adding `%s' to list at %#08x.\n", name, p1 );
#endif
  for( p=name; (*p1++=*p++)!='\0'; );
  *p1= '\0';		/* end-of-list code */
  return( p0 );
}


char*	list_entry(
		char*	list,
		int	index )
/* returns pointer to index-th entry, index in [0,noe) */
/* if index is out of bounds, string of size 0 is returned */
{
  char* p= list;
  int i= 0;
  if( list == NULL ) return( NULL );
  while( *p != '\0' && i<index )
  {
    while( *p++ != '\0' );
    i++;
  }
  return( p );
}


off_t	UCHARs_2_off_t(
		unsigned char	*p )
{
  off_t val= (off_t)0;
  int i;
  for( i=0; i<sizeof(off_t); i++ ) val|= p[i]<<(i*8);
  return( val );
}


off_t	off_t_2_UCHARs(
		off_t	val,
		unsigned char*	p )
{
  int i;
  for( i=0; i<sizeof(off_t); i++) p[i]= (unsigned char)(val>>(i*8)&0xff);
  return( val );
}


int	my_open(
		char*	fn,	/* file name */
		int	mode,	/* access mode (flags for open(2)) */
		mode_t	perm,	/* permissions (mode for open(2)) */
		char*	pn )	/* name of main program */
/* returns file descriptor or -1 on error */
{
  int fd;
  if( (fd=open(fn,mode,perm)) == -1 )
    fprintf(ERROR_CHANNEL,"%s: Cannot open `%s' for %s. %s.\n",
            pn, fn, FILE_ACCESS_MODE(mode), strerror(errno));
  return( fd );
}


int	my_close(
		int	fd,	/* file descriptor */
		char*	fn,	/* file name */
		char*	pn )	/* name of main program */
/* returns 0 or -1 on error */
{
  int rv;
  if( (rv=close(fd)) == -1 )
    fprintf(ERROR_CHANNEL,"%s: Could not close `%s' successfully. %s.\n",
            pn, fn, strerror(errno));
  return( rv );
}


off_t	my_lseek(
		int	fd,	/* file descriptor */
		off_t	off,	/* file offset */
		int	whence,	/* reference position */
		char*	fn,	/* file name */
		char*	pn )	/* name of main program */
/* returns new file offset or -1 on error */
{
  off_t	new_off;
  if( (new_off=lseek(fd,off,whence)) == -1 )
    fprintf(ERROR_CHANNEL,"%s: Cannot lseek `%s'. %s.\n",
            pn, fn, strerror(errno));
  return( new_off );
}


ssize_t	my_read(
		int	fd,	/* file descriptor */
		void*	buf,	/* buffer */
		ssize_t	nbtr,	/* number of bytes to read */
		char*	fn,	/* file name */
		char*	pn )	/* name of main program */
/* returns number of bytes read or -1 on error */
/* like read(2) but nbr<nbtr only if eof reached */
{
  ssize_t nbr;
  ssize_t tnbr= 0;
  ssize_t rem= nbtr;
  unsigned char *p= (unsigned char*)buf;
  do
  {
    if( (nbr=read(fd,p+tnbr,rem)) == -1 )
    {
      fprintf(ERROR_CHANNEL,"%s: Cannot read from `%s'. %s.\n",
              pn, fn, strerror(errno));
      return( -1 );
    }
    tnbr+= nbr;
    rem= nbtr - tnbr;
  }
  while( nbr>0 && rem>0 );
  return( tnbr );
}


ssize_t	my_write(
		int	fd,	/* file descriptor */
		void*	buf,	/* buffer */
		ssize_t	nbtw,	/* number of bytes to write */
		char*	fn,	/* file name */
		char*	pn )	/* name of main program */
/* writes nbtw buffer to fd */
/* returns number of bytes written ( ==nbtw ) or -1 on error */
{
  ssize_t nbw;
  ssize_t tnbw= 0;
  ssize_t rem= nbtw;
  unsigned char *p= (unsigned char*)buf;
  do
  {
    if( (nbw=write(fd,p+tnbw,rem)) == -1 )
    {
      fprintf( ERROR_CHANNEL, "%s: Cannot write to `%s'. %s.\n",
               pn, fn, strerror(errno));
      return( -1 );
    }
    tnbw+= nbw;
    rem= nbtw - tnbw;
  }
  while( nbw>0 && rem>0 );
  if( tnbw < nbtw )
  {
    fprintf(ERROR_CHANNEL,"%s: Cannot write (%d bytes) to `%s'.\n",
            pn, nbtw, fn );
    return( -1 );
  }
  return( tnbw );
}


int	my_mkdir(
		char*	fn,	/* filename to use path from */
		mode_t	perm,	/* permissions (mode for open(2)) */
		char*	pn )	/* name of main program */
/* returns 0 on success or -1 on error */
{
  char buf[MAX_FN_LEN];
  char *p;
  int i,j;
  int ndir= 0;		/* number of directories to create */
  for( p=fn; *p!='\0'; p++ ) if( *p=='/' ) ndir++;
  for( j=0; j<ndir; j++ )
  {
    int cnt= 0;
    for( i=0; cnt<=j; i++ )
      if( (buf[i]=fn[i]) == '/' ) cnt++;
    buf[i-1]= '\0';
    if( (mkdir(buf,perm)==-1) && errno!=EEXIST )
    {
      fprintf( ERROR_CHANNEL, "%s: Cannot make directory `%s'. %s.\n",
               pn, buf, strerror(errno) );
      return( -1 );
    }
  }
  return( 0 );
}


int	init_pak_header(
		struct pak_header*	p_pak_hdr )	/* pak header */
/* inits pak header structure (== pak header for empty archive) */
/* returns 0 on success or -1 on error */
{
  if( p_pak_hdr == NULL ) return ( -1 );
  strcpy( p_pak_hdr->magic, PAK_MAGIC );
  p_pak_hdr->toc_off= (off_t) PAK_HDR_SIZE;
  p_pak_hdr->toc_sze= (off_t) 0;
  p_pak_hdr->pak_sze= (off_t) PAK_HDR_SIZE;
  return( 0 );
}


int	read_pak_header(
		struct pak_header*	p_pak_hdr,	/* pak header */
		char*			pak_fn,		/* pak file name */
		char*			pn )		/* name of main prg. */
/* reads header from pak archive */
/* returns 0 or -1 on error */
{
  int rv= 0;
  unsigned char buf[PAK_HDR_SIZE];
  int i;
  int pak_fd;
  off_t pak_sze;
  ssize_t nbr;
  if( init_pak_header(p_pak_hdr) == -1 ) return( -1 );
  if( (pak_fd=my_open(pak_fn,O_RDONLY,PERMISSIONS,pn)) == -1 ) return( -1 );
  /* fill buffer */
  if( (nbr=my_read(pak_fd,buf,PAK_HDR_SIZE,pak_fn,pn)) < PAK_HDR_SIZE )
  { /* read error or file too small */
    if( nbr > -1 )
      fprintf( ERROR_CHANNEL, "%s: File `%s' is not a pak archive. File too small.\n", pn, pak_fn );
    rv= -1; goto RETURN;
  }
  /* magic */
  for( i=0; i<PAK_MAGIC_SIZE; i++ ) p_pak_hdr->magic[i]= buf[i];
  /* toc offset */
  p_pak_hdr->toc_off= UCHARs_2_off_t( buf+PAK_MAGIC_SIZE );
  /* toc size */
  p_pak_hdr->toc_sze= UCHARs_2_off_t( buf+PAK_MAGIC_SIZE+PAK_OFFSET_SIZE );
  /* pak size */
  if( (pak_sze=my_lseek(pak_fd,(off_t)0,SEEK_END,pak_fn,pn)) == -1 )
  { rv= -1; goto RETURN; }
  p_pak_hdr->pak_sze= pak_sze;
RETURN:
  if(  my_close(pak_fd,pak_fn,pn) == -1 ) return( -1 );
  return( rv );
}


int	write_pak_header(
		struct pak_header*	p_pak_hdr,	/* pak header */
		int			or_mode,	/* or-ed mode for open*/
		char*			pak_fn,		/* pak file name */
		char*			pn )		/* name of main prog. */
/* overwrites header of pak archive with values from p_pak_hdr */
/* returns 0 on success or -1 on error */
{
  int pak_fd;
  int rv= 0;
  unsigned char buf[PAK_HDR_SIZE];
  int i;
  if( p_pak_hdr == NULL ) return( -1 );
  if( (pak_fd=my_open(pak_fn,O_CREAT|O_WRONLY|or_mode,PERMISSIONS,pn)) == -1 )
  { rv= -1; return( rv ); }
  /* magic */
  for( i=0; i<PAK_MAGIC_SIZE; i++ ) buf[i]= p_pak_hdr->magic[i];
  /* toc offset */
  off_t_2_UCHARs( p_pak_hdr->toc_off, buf+PAK_MAGIC_SIZE );
  /* toc size */
  off_t_2_UCHARs( p_pak_hdr->toc_sze, buf+PAK_MAGIC_SIZE+PAK_OFFSET_SIZE );
  if( my_write(pak_fd,buf,PAK_HDR_SIZE,pak_fn,pn) == -1 )
  { rv= -1; goto RETURN; }
RETURN:
  my_close( pak_fd, pak_fn, pn );
  return( rv );
}


int	check_pak_header(
		struct pak_header*	p_pak_hdr,	/* pak header */
		char*			pak_fn,		/* pak file name */
		char*			pn )		/* name of main prog. */
/* returns number of toc entries or -1 on error */
{
  int noe;
  if( strcmp(p_pak_hdr->magic,PAK_MAGIC) )
  {
    fprintf(ERROR_CHANNEL,"%s: File `%s' is not a pak archive. %s.\n",
            pn, pak_fn, "Wrong magic number");
    return( -1 );
  }
  if( p_pak_hdr->toc_off < (off_t)PAK_HDR_SIZE )
  {
    fprintf(ERROR_CHANNEL,"%s: Pak archive `%s' corrupted. Toc offset = %d.\n",
            pn, pak_fn, (int)p_pak_hdr->toc_off);
    return( -1 ); 
  }
  if( p_pak_hdr->toc_sze < (off_t)0 )
  {
    fprintf(ERROR_CHANNEL,"%s: Pak archive `%s' corrupted. Toc size = %d.\n",
            pn, pak_fn, (int)p_pak_hdr->toc_sze);
    return( -1 );
  }
  if( p_pak_hdr->pak_sze != p_pak_hdr->toc_off + p_pak_hdr->toc_sze )
  {
    fprintf(ERROR_CHANNEL,"%s: Pak archive `%s' corrupted. %s.\n",
            pn, pak_fn, "Pak file size != toc offset + toc size");
    return( -1 );
  }
  noe= p_pak_hdr->toc_sze/PAK_TOC_ENTRY_SIZE;
  if( p_pak_hdr->toc_sze%PAK_TOC_ENTRY_SIZE )
  {
    fprintf(ERROR_CHANNEL,"%s: Pak archive `%s' corrupted. %3.2f toc entries.\n", pn, pak_fn, (p_pak_hdr->toc_sze*1.0)/PAK_TOC_ENTRY_SIZE );
    return( -1 );
  }
#ifndef ALLOW_EMPTY_ARCHIVES
  if( noe == 0 )
  {
    fprintf(ERROR_CHANNEL,"%s: Pak archive `%s' is empty.\n",
            pn, pak_fn );
    return( -1 );
  }
#endif
  return( noe );
}


struct pak_tocentry*	realloc_pak_toc(
		struct pak_tocentry*	pak_toc,	/* pak toc */
		int			noe,	/* number of entries to alloc */
		char* 			pn )	/* name of main program */
/* reallocates memory for array[noe] of pak tocentries */
/* new memory is initialized */
/* returns pointer to tocentry-array or NULL on error or noe==0 */
/* on error the memory is freed */
{
  static int noea= 0;		/* number of entries already allocated for */
  struct pak_tocentry* rv;	/* return value */
  int i,imax,j;
/*
  The following if-statement is neccessary only due to a bug (with respect
  to the man pages) in realloc(2) which doesn't return NULL if size is zero
*/
  if( noe )
  {
    if( (rv=realloc(pak_toc,(size_t)(noe*sizeof(struct pak_tocentry)))) == NULL )
    {
      fprintf( ERROR_CHANNEL,"%s: Allocation problems (%d bytes).\n",
               pn, noe*sizeof(struct pak_tocentry) );
      free( pak_toc );
      return( NULL );
    }
  }
  else
    rv= NULL;
  /* init new memory */
  imax= sizeof(rv[0].f_nme);
  for( j=noea; j<noe; j++ )
  {
    for( i=0; i<imax; i++ ) rv[j].f_nme[i]= '\0';
    rv[j].f_off= (off_t)0;
    rv[j].f_sze= (off_t)0;
  }
  noea= noe;
  return( rv );
}


struct pak_tocentry*	read_pak_toc(
		struct pak_header*	p_pak_hdr,	/* pak header */
		char*			pak_fn,		/* pak file name */
		char*			pn )	/* name of main program */
/* returns address of first tocentry or NULL on error or empty pak */
{
  struct pak_tocentry* pak_toc;
  struct pak_tocentry* rv;
  int noe= p_pak_hdr->toc_sze/PAK_TOC_ENTRY_SIZE;	/* number of entries */
  unsigned char buf[PAK_TOC_ENTRY_SIZE];
  int pak_fd;
  ssize_t nbr;
  int i,j;
  if( (pak_toc=realloc_pak_toc(NULL,noe,pn)) == NULL )
  { return( NULL ); }
  rv= pak_toc;
  if( (pak_fd=my_open(pak_fn,O_RDONLY,PERMISSIONS,pn)) == -1 )
  { rv= NULL; goto RETURN; }
  if( my_lseek(pak_fd,p_pak_hdr->toc_off,SEEK_SET,pak_fn,pn) == -1 )
  { rv= NULL; goto RETURN; }
  /* fill entries */
  for( j=0; j<noe; j++ )
  {
    if( (nbr=my_read(pak_fd,buf,PAK_TOC_ENTRY_SIZE,pak_fn,pn)) < PAK_TOC_ENTRY_SIZE )
    { /* shouldn't happen if header has been checked against pak size */
      if( nbr > -1 )
        fprintf( ERROR_CHANNEL, "%s: Pak archive `%s' corrupted. %s.\n",
                 pn, pak_fn, "File too small" );
      rv= NULL; goto RETURN;
    }
    for( i=0; i<PAK_TOC_FN_LEN; i++ ) pak_toc[j].f_nme[i]= buf[i];
    pak_toc[j].f_off= UCHARs_2_off_t( buf+PAK_TOC_FN_LEN );
    pak_toc[j].f_sze= UCHARs_2_off_t( buf+PAK_TOC_FN_LEN+PAK_OFFSET_SIZE );
  }
RETURN:
  if( rv == NULL ) realloc_pak_toc( pak_toc, 0, pn );
  if( my_close(pak_fd,pak_fn,pn) == -1 ) return( NULL );
  return( rv );
}


int	write_pak_toc(
		struct pak_header*	p_pak_hdr,	/* pak header */
		struct pak_tocentry*	pak_toc,	/* pak toc */
		char*			pak_fn,		/* pak file name */
		char*			pn )	/* name of main program */
/* append toc to existing pak archive at p_pak_hdr->toc_off */
/* file header is not read */
/* returns 0 on success or -1 on error */
{
  int pak_fd;
  int pak_noe;
  int rv= 0;
  int i,j;
  unsigned char buf[PAK_TOC_ENTRY_SIZE];
  if( (pak_fd=my_open(pak_fn,O_WRONLY,PERMISSIONS,pn)) == -1 ) return( -1 );
  if( my_lseek(pak_fd,p_pak_hdr->toc_off,SEEK_SET,pak_fn,pn) == -1 )
  { rv= -1; goto RETURN; }
  pak_noe= p_pak_hdr->toc_sze/PAK_TOC_ENTRY_SIZE;
  for( j=0; j<pak_noe; j++ )
  {
    /* fill buffer */
    for( i=0; i<PAK_TOC_FN_LEN; i++ ) buf[i]= '\0';
    strcpy( (char*)buf, pak_toc[j].f_nme );
    off_t_2_UCHARs( pak_toc[j].f_off, buf+PAK_TOC_FN_LEN );
    off_t_2_UCHARs( pak_toc[j].f_sze, buf+PAK_TOC_FN_LEN+PAK_OFFSET_SIZE );
    /* write buffer to pak file */
    if( my_write(pak_fd,buf,PAK_TOC_ENTRY_SIZE,pak_fn,pn) == -1 )
    { rv= -1; goto RETURN; }
  }
RETURN:
  if( my_close(pak_fd,pak_fn,pn) == -1 ) rv= -1;
  return( rv );
}


int	check_pak_toc(
		struct pak_tocentry*	pak_toc,	/* pak toc */
		int			noe,		/* number of entries */
		char*			pak_fn,		/* pak filename */
		char*			pn )	/* name of main program */
/* returns 0 on success or -1 on error */
{
  int j;
  if( pak_toc == NULL ) return( 0 );	/* emtpy toc */
  if( pak_toc[0].f_off != PAK_HDR_SIZE )
  {
    fprintf(ERROR_CHANNEL,"%s: Pak archive `%s' corrupted (toc entry %d).\n",
            pn, pak_fn, 0 );
    return( -1 );
  }
  for( j=1; j<noe; j++ )
    if( pak_toc[j].f_off < pak_toc[j-1].f_off + pak_toc[j-1].f_sze )
    {
      fprintf(ERROR_CHANNEL,"%s: Pak archive `%s' corrupted (toc entry %d).\n",
              pn, pak_fn, j );
      return( -1 );
    }
  return( 0 );
}


int	list_pak_toc(
		struct pak_tocentry*	pak_toc,	/* pak toc */
		int			pak_noe,	/* number of entries */
		char*			list,		/* file name list */
		int			verbose,	/* verbose flag */
		int			force,		/* force flag */
		char*			pak_fn,		/* pak filename */
		char*			pn )	/* name of main program */
/* returns number of files listed or -1 on error */
{
  int list_noe;
  unsigned char* list_mark= NULL;
  int maxlen= 0;
  int i,j;
  char* fn;
  int nbl= 0;			/* number of bytes listed */
  int nfl= 0;			/* number of files listed */
  int tnb= 0;			/* total number of bytes */
  if( (list_noe=is_in_list(list,"")-1) )
  {
    if( (list_mark=malloc((list_noe)*sizeof(unsigned char))) == NULL )
    {
      fprintf( ERROR_CHANNEL, "%s: Allocation problem (%d bytes).\n",
               pn, list_noe*sizeof(unsigned char) );
      return( -1 );
    }
    for( j=0; j<list_noe; j++ ) list_mark[j]= (unsigned char)0;
  }
  /* find length of longest filename */
  for( j=0; j<pak_noe; j++ )
  {
    fn= pak_toc[j].f_nme;
    if( list_noe==0 || is_in_list(list,fn) )
      maxlen= strlen(fn) > maxlen ? strlen(fn) : maxlen;
  }
  /* list */
  for( j=0; j<pak_noe; j++ )
  {
    fn= pak_toc[j].f_nme;
    tnb+= pak_toc[j].f_sze;
    if( list_noe==0 || is_in_list(list,fn) )
    {
      nfl++;
      nbl+= pak_toc[j].f_sze;
      if( list_noe ) list_mark[is_in_list(list,fn)-1]= (unsigned char)1;
      printf( "%s", fn );
      if( verbose )
      {
        for( i=strlen(fn); i<maxlen; printf(" "), i++ );
        printf( "%8d", (int)pak_toc[j].f_sze );
      }
      printf( "\n" );
    }
  }
  if( list_noe && !force )
  { /* check for specified but unlisted files */
    for( j=0; j<list_noe; j++)
      if( !list_mark[j] )
        fprintf( ERROR_CHANNEL, "%s: File `%s' not found in archive.\n",
                 pn, list_entry(list,j) );
  }
  if( verbose )
  {
    printf( "Summary for pak archive `%s': \n", pak_fn );
    printf( "  Listed: %d file%s, %d bytes\n",
            nfl, nfl>1?"s":"",nbl );
    printf( "   Total: %d file%s, %d bytes\n",
            pak_noe, pak_noe>1?"s":"",tnb );
  }
  free( list_mark );
  if( nfl<list_noe && !force ) return( -1 );
  return( nfl );
}


int	extract_pak(
		struct pak_tocentry*	pak_toc,	/* pak toc */
		int			pak_noe,	/* number of entries */
		char*			list,		/* file name list */
		int			verbose,	/* verbose flag */
		int			force,		/* force flag */
		char*			pak_fn,		/* pak filename */
		char*			pn )	/* name of main program */
/* returns number of files extracted or -1 on error */
{
  int list_noe;
  unsigned char* list_mark= NULL;
  int nbe= 0;		/* number of bytes extracted */
  int nfe= 0;		/* number of files extracted */
  int tnb= 0;		/* total number of bytes */
  int j;
  int pak_fd;
  char* fn;		/* filename from pak-toc == name of generated file */
  int fd;
  off_t off;
  off_t sze;

  if( (list_noe=is_in_list(list,"")-1) )
  { /* set up marker array and init */
    if( (list_mark=malloc((list_noe)*sizeof(unsigned char))) == NULL )
    {
      fprintf( ERROR_CHANNEL, "%s: Allocation problem (%d bytes).\n",
               pn, list_noe*sizeof(unsigned char) );
      return( -1 );
    }
    for( j=0; j<list_noe; j++ ) list_mark[j]= (unsigned char)0;
  }
  /* extract */
  if( (pak_fd=my_open(pak_fn,O_RDONLY,PERMISSIONS,pn)) == -1 )
  { nfe= -1; goto RETURN; }
  for( j=0; j<pak_noe; j++ )
  {
    fn= pak_toc[j].f_nme;
    off= pak_toc[j].f_off;
    sze= pak_toc[j].f_sze;
    tnb+= sze;
    if( list_noe==0 || is_in_list(list,fn) )
    { /* extract one file */
      unsigned char buf[CP_BUF_SIZE];	/* buffer for copying */
      ssize_t rem= sze;		/* remaining bytes */
      ssize_t nbr;
      ssize_t nbtr;
      if( verbose ) printf( "%s, %d bytes\n", fn, (int)sze );
      if( my_lseek( pak_fd, off, SEEK_SET, pak_fn, pn ) == -1 )
      { nfe= -1; goto RETURN; }
      if( my_mkdir(fn,DIR_PERMISSIONS,pn) == -1 )
      { nfe= -1; goto RETURN; }
      if( (fd=my_open(fn,O_CREAT|O_WRONLY|O_TRUNC,PERMISSIONS,pn)) == -1 )
      { nfe= -1; goto RETURN; }
      while( rem > 0 )
      {
        nbtr= rem>CP_BUF_SIZE?CP_BUF_SIZE:rem;
        if( (nbr=my_read(pak_fd,buf,nbtr,fn,pn)) < nbtr )
        { /* shouldn't happen if pak-toc has been checked against pak size */
          if( nbr > -1 )
            fprintf( ERROR_CHANNEL, "%s: Pak archive `%s' corrupted. %s.\n",
                     pn, pak_fn, "File too small." );
          nfe= -1; my_close(fd,fn,pn); goto RETURN;
        }
        if( my_write(fd,buf,nbr,fn,pn) == -1 )
        { nfe= -1; my_close(fd,fn,pn); goto RETURN; }
        rem-= nbr;
      }
      if( my_close(fd,fn,pn) == -1 )
      { nfe= -1; goto RETURN; }
      if( list_noe ) list_mark[is_in_list(list,fn)-1]= (unsigned char)1;
      nfe++;
      nbe+= sze;
    }
  }
  if( list_noe && !force )
  { /* check for specified but unextracted files */
    for( j=0; j<list_noe; j++)
      if( !list_mark[j] )
        fprintf( ERROR_CHANNEL, "%s: File `%s' not found in archive.\n",
                 pn, list_entry(list,j) );
  }
  if( verbose )
  {
    printf( "Summary for pak archive `%s': \n", pak_fn );
    printf( "  Extracted: %d file%s, %d bytes\n",
            nfe, nfe>1?"s":"", nbe );
    printf( "      Total: %d file%s, %d bytes\n",
            pak_noe, pak_noe>1?"s":"", tnb );
  }
RETURN:
  free( list_mark );
  my_close( pak_fd, pak_fn, pn );
  if( nfe<list_noe && !force ) return( -1 );
  return( nfe );
}


struct pak_tocentry*	write_pak(
		struct pak_header*	p_pak_hdr,	/* pak header */
		char*			list,		/* file (name) list */
		int			verbose,	/* be talketive */
		int			force,		/* ignore some errors */
		char*			pak_fn,		/* pak filename */
		char*			pn )	/* name of main program */
/* writes files from list to pak archive at PAK_HDR_SIZE */
/* sets up pak_toc and updates p_pak_hdr */
/* neither pak_toc nor p_pak_hdr is written */
/* archive MUST exist and MUST be smaller than the resulting one !!!! */
/* returns pac_toc on success or NULL on error or empty list */
{
  struct pak_tocentry* pak_toc;
  struct pak_tocentry* rv;
  int pak_fd;
  off_t pak_off;
  int pak_noe= 0;
  char* fn;
  int fd;
  off_t sze;
  int j;
  int list_noe= is_in_list(list,"")-1;
  unsigned char buf[CP_BUF_SIZE];	/* copy buffer */
  ssize_t rem;			/* remaining bytes */
  ssize_t nbr;			/* number of bytes read */
  ssize_t nbtr;			/* number of bytes to read */
  p_pak_hdr->toc_sze= list_noe*PAK_TOC_ENTRY_SIZE;    /* for error detection */
  if( (pak_toc=realloc_pak_toc(NULL,list_noe,pn)) == NULL ) return( NULL );
  /* non-empty list */
  rv= pak_toc;
  if( (pak_fd=my_open(pak_fn,O_WRONLY,PERMISSIONS,pn)) == -1 )
  { rv= NULL; goto RETURN; }
  if( (pak_off=my_lseek(pak_fd,PAK_HDR_SIZE,SEEK_SET,pak_fn,pn)) == -1 )
  { rv= NULL; goto RETURN; }
  for( j=0; j<list_noe; j++ )
  {
    fn= list_entry( list, j );
#ifdef DEBUG
  fprintf( DEBUG_CHANNEL,"DEBUG: write_pak(): Processing `%s' (list index %d).\n", fn, j );
#endif
    if( strlen(fn)+1 > MAX_FN_LEN )
    { /* name too long */
      if( force )
      {
        p_pak_hdr->toc_sze-= PAK_TOC_ENTRY_SIZE;
        continue;
      }
      rv= NULL; goto RETURN;
    }
    if( (fd=open(fn,O_RDONLY)) == -1 )
    {
      if( force )
      {
        p_pak_hdr->toc_sze-= PAK_TOC_ENTRY_SIZE;
        continue;
      }
      my_open(fn,O_RDONLY,PERMISSIONS,pn);	/* for error message only */
      rv= NULL; goto RETURN;
    }
    if( (sze=my_lseek(fd,(off_t)0,SEEK_END,fn,pn)) == -1 )
    { rv= NULL; my_close(fd,fn,pn); goto RETURN; }
    my_lseek(fd,(off_t)0,SEEK_SET,fn,pn);
    /* copy data of one file */
#ifdef DEBUG
  fprintf( DEBUG_CHANNEL,"DEBUG: write_pak(): Copying file `%s' to pak file @ %#08x\n", fn, pak_off );
#endif
    if( verbose ) printf( "%s, %d bytes\n", fn, (int)sze );
    rem= sze;
    while( rem > 0 )
    {
      nbtr= rem>CP_BUF_SIZE?CP_BUF_SIZE:rem;
      if( (nbr=my_read(fd,buf,nbtr,fn,pn)) < nbtr )
      { /* shouldn't happen since size is known from lseek */
        if( nbr > -1 )
          fprintf( ERROR_CHANNEL, "%s: Cannot read from file `%s'. %s.\n",
                   pn, fn, "File too small" );
        rv= NULL; my_close(fd,fn,pn); goto RETURN;
      }
      if( my_write(pak_fd,buf,nbr,pak_fn,pn) == -1 )
      { rv= NULL; my_close(fd,fn,pn); goto RETURN; }
      rem-= nbr;
    }
    /* set toc data */
    strcpy( pak_toc[pak_noe].f_nme, fn );
    pak_toc[pak_noe].f_off= pak_off;
    pak_toc[pak_noe].f_sze= sze;
    pak_noe++;
    pak_off+= sze;
    if( my_close(fd,fn,pn) == -1 )
    { rv= NULL; goto RETURN; }
  }
  /* update p_pak_hdr */
  p_pak_hdr->toc_off= pak_off;
  p_pak_hdr->toc_sze= pak_noe*PAK_TOC_ENTRY_SIZE;
RETURN:
  my_close( pak_fd, pak_fn, pn );
  if( rv == NULL ) free(pak_toc);
  return( rv );
}


char*
basename( char* name ) {
/*
 * strip directory from name
 * returns pointer to stripped name
 * hint: basename("/usr/bin/") == ""
 *   basename(1) would return "bin" !!
 */
  char* p= name;
  while( *p != '\0' ) p++;
  while( p > name ) {
    if( *(p-1) == '/' ) break;
    else p--;
  }
  return( p );
}


int maine( int argc, char** argv) {
/*
 * main() par
 * started      : Sat Jul 4 00:33:50 MET DST 1998 @beast
 */

    int ii;

    printf("The following arguments were passed to main(): ");
    for(ii=0; ii<argc; ii++) printf("%s ", argv[ii]);
    printf("\n");

  /*** getopt stuff ***/
  int c;
  extern char *optarg;
  extern int optind;
  /*** options stuff ***/
  int action= ACTION_NONE;
  int indirect_files= 0;
  int force= 0;
  int verbose= 0;
  /*** file stuff ***/
  char *pak_fn= NULL;			/* pak file name */
  int pak_fd= 0;			/* pak file descriptor */
  struct pak_header pak_hdr;		/* pak file header */
  int pak_nf;				/* pak file number of files cantained */
  struct pak_tocentry *pak_toc=NULL;	/* pak file toc (array of tocentries) */
  char *tmp_fn;
  int tmp_fd= 0;
  char fn_buf[MAX_FN_LEN];
  int nbr;
  /*** miscellanious ***/
  char *file_list= add_to_list("");	/* init list */
  int retval= RETVAL_OK;
  char* fpn= *argv;			/* full program name */
  char* pn= basename( fpn );		/* prg_name is Makefile constant */
  int i;
  int index;
  int eof_reached;
  /***** process options *****/
  *argv= pn;				/* give getop() the cut name */
  while( (c=getopt(argc,argv,"cfhltvxV")) != EOF )
    switch( c ) {
      case 'c': /* action: create */
        if( action == ACTION_NONE ) action= ACTION_CREATE;
        else {
          fprintf( ERROR_CHANNEL,
                   "%s: Two actions specified. Try -h for help.\n", pn );
          retval= RETVAL_ERROR; goto DIE_NOW;
        }
        break;
      case 'f': /* force action */
        force= 1;
        break;
      case 'h': /* display help to HELP_CHANNEL and exit sucessfully */
        display_help( pn );
        retval= RETVAL_OK; goto DIE_NOW;
      case 'l': /* action: list */
        if( action == ACTION_NONE ) action= ACTION_LIST;
        else {
          fprintf( ERROR_CHANNEL,
                   "%s: Two actions specified. Try -h for help.\n", pn );
          retval= RETVAL_ERROR; goto DIE_NOW;
        }
        break;
      case 't': /* get filenames from specified files */
        indirect_files= 1;
        break;
      case 'v': /* be verbose */
        verbose++;
        break;
      case 'x': /* action: extract */
        if( action == ACTION_NONE ) action= ACTION_EXTRACT;
        else {
          fprintf( ERROR_CHANNEL,
                   "%s: Two actions specified. Try -h for help.\n", pn );
          retval= RETVAL_ERROR; goto DIE_NOW;
        }
        break;
      case 'V':	/* display version to VERSION_CHANNEL and exit sucessfully */
        display_version( pn );
        retval= RETVAL_OK; goto DIE_NOW;
      case '?': /* refer to -h and exit unsucessfully */
        fprintf( ERROR_CHANNEL, "%s: Try `%s -h' for more information.\n",
                 pn, fpn );
        retval= RETVAL_ERROR; goto DIE_NOW;
      default : /* program error */
        fprintf( ERROR_CHANNEL, "%s: Options bug! E-mail me at %s.\n",
                 pn, MY_EMAIL_ADDRESS );
        retval= RETVAL_BUG; goto DIE_NOW;
    }
  if( action == ACTION_NONE ) {
    fprintf( ERROR_CHANNEL, "%s: No action specified. Try -h for help.\n", pn );
    retval= RETVAL_ERROR; goto DIE_NOW;
  }
  /***** set pak_fn *****/
  if( optind == argc ) {
      fprintf( ERROR_CHANNEL, "%s: No archive specified.\n", pn );
      retval= RETVAL_ERROR; goto DIE_NOW;
  }
  pak_fn= argv[optind];
  /***** get file list *****/
  for( index=optind+1; index<argc; index++ ) {
    tmp_fn= argv[index];
    if( indirect_files ) {
      /* add names from file tmp_fn to list */
      if( (tmp_fd=my_open(tmp_fn,O_RDONLY,PERMISSIONS,pn)) == -1 ) {
        retval= 1; goto DIE_NOW;
      }
      /* blanks are allowed ==> separator is 0x0a */
      eof_reached= 0;
      while( !eof_reached ) {
        /* read file name to buffer */
        for( i=0; i<MAX_FN_LEN; i++ ) {
          if( (nbr=my_read(tmp_fd,&fn_buf[i],1,tmp_fn,pn)) == -1 ) {
            retval= RETVAL_ERROR; goto DIE_NOW;
          }
          if( nbr == 0 ) {
            eof_reached= 1;
            fn_buf[i]='\0';
            break;
          }
          if( fn_buf[i] == 0x0a ) {
            fn_buf[i]='\0';
            break;
          }
        }
        if( i == MAX_FN_LEN ) {
          fn_buf[i-1]= '\0';
          fprintf( ERROR_CHANNEL,
                   "%s: File name `%s' from file `%s' too long.\n",
                   pn, fn_buf, tmp_fn );
          retval= RETVAL_ERROR; goto DIE_NOW;
        }
        /* add file name to list */
        file_list= add_to_list( fn_buf );
        if( file_list == NULL ) { 
          fprintf( ERROR_CHANNEL, "%s: Allocation problem.\n", pn );
          retval= RETVAL_ERROR; goto DIE_NOW;
        }
      }
    }
    else {
      /* add tmp_fn to list */
      if( strlen(tmp_fn) >= MAX_FN_LEN ) {
        fprintf( ERROR_CHANNEL, "%s: File name `%s' too long.\n", pn, tmp_fn );
        retval= RETVAL_ERROR; goto DIE_NOW;
      }
      file_list= add_to_list( tmp_fn );
      if( file_list == NULL ) {
        fprintf( ERROR_CHANNEL, "%s: Allocation problem.\n", pn );
        retval= RETVAL_ERROR; goto DIE_NOW;
      }
    }
  }
#ifdef DEBUG
  fprintf( DEBUG_CHANNEL, "DEBUG: main(): List has %d entries, namely:\n", is_in_list(file_list,"")-1 );
  for( i=0; i<is_in_list(file_list,"")-1; i++ )
    fprintf( DEBUG_CHANNEL, "DEBUG: main(): %d - %#08x - `%s'\n", i, list_entry(file_list,i), list_entry(file_list,i) );
#endif
  /***** do the dirty work *****/
  switch( action ) {
    case ACTION_LIST: /* list table of contents */
      if( read_pak_header(&pak_hdr,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( (pak_nf=check_pak_header(&pak_hdr,pak_fn,pn)) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
#ifdef	DEBUG
      fprintf( DEBUG_CHANNEL, "DEBUG: pak size  = %#08x\n",pak_hdr.pak_sze);
      fprintf( DEBUG_CHANNEL, "DEBUG: toc offset= %#08x\n",pak_hdr.toc_off);
      fprintf( DEBUG_CHANNEL, "DEBUG: toc size  = %#08x\n",pak_hdr.toc_sze);
      fprintf( DEBUG_CHANNEL, "DEBUG: files     = %d\n",pak_nf);
#endif
      if( (pak_toc=read_pak_toc(&pak_hdr,pak_fn,pn)) == NULL && pak_nf )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( check_pak_toc(pak_toc,pak_nf,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( list_pak_toc(pak_toc,pak_nf,file_list,verbose,force,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      break;
    case ACTION_EXTRACT: /* extract file(s) */
      if( read_pak_header(&pak_hdr,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( (pak_nf=check_pak_header(&pak_hdr,pak_fn,pn)) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( (pak_toc=read_pak_toc(&pak_hdr,pak_fn,pn)) == NULL && pak_nf )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( check_pak_toc(pak_toc,pak_nf,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( extract_pak(pak_toc,pak_nf,file_list,verbose,force,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      break;
    case ACTION_CREATE: /* create new pak file */
      if( init_pak_header(&pak_hdr) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( write_pak_header(&pak_hdr,O_TRUNC,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( (pak_toc=write_pak(&pak_hdr,file_list,verbose,force,pak_fn,pn)) == NULL && pak_hdr.toc_sze )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( write_pak_toc(&pak_hdr,pak_toc,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      if( write_pak_header(&pak_hdr,0x00,pak_fn,pn) == -1 )
      { retval= RETVAL_ERROR; goto DIE_NOW; }
      break;
    default: /* program error */
      fprintf( ERROR_CHANNEL, "%s: Action %d unknown! E-mail me at %s.\n",
               pn, action, MY_EMAIL_ADDRESS );
      retval= RETVAL_BUG; goto DIE_NOW;
  }
DIE_NOW:
  free( pak_toc );
  free( file_list );
  close( pak_fd );
  close( tmp_fd );
  if( action==ACTION_CREATE )
  { /* remove pak file on error */
#ifndef ALLOW_EMPTY_ARCHIVES
    if( pak_hdr.toc_sze==0 ) {
      fprintf( ERROR_CHANNEL, "%s: Creation of empty archives not allowed.\n",
               pn );
      retval= RETVAL_ERROR;
    }
#endif
    if( retval==RETVAL_ERROR && pak_fn!=NULL ) {
      /* let's do it quick and dirty... */
      char cmd[PAK_TOC_ENTRY_SIZE];
      sprintf( cmd, "rm -f %s", pak_fn );
      system( cmd );
    }
  }
  exit( retval );
}
#ifdef html
EMSCRIPTEN_KEEPALIVE jsextract(char*);
EMSCRIPTEN_KEEPALIVE jsextract(char* filename){
    char *params[3];
    params[0] = "par";
    params[1] = "-x";
    params[2] = filename;
    maine(3, params);
}
#endif

